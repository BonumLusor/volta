-- ----------------------------------------------------------------------------
-- Atualiza Plano de Corte - PLANEJADO
--
-- --------------------------------------------------------
--
-- * Cód Colaborador que cadastrou o Plano
--
-- --------------------------------------------------------
--
-- * Situação do Plano de Corte
--     0 : Gerado
--    10 : Planejado
--    20 : Cortado
--    90 : Cancelado
--
-- --------------------------------------------------------
UPDATE cv_plano_corte
SET cod_colaborador_update = {cod_colaborador}, updated_at = NOW(), situacao = 10
WHERE cod_plano_corte = {cod_plano_corte}
;


-- --------------------------------------------------------
--      Atualiza situação dos rolos
--        ***  NÃO USADOS ***
--              eq_saldo
-- Rodar esta query para cada rolo NÃO USADO
-- Libera o rolo
UPDATE eq_saldo
SET
  cod_plano_corte = null,
  situacao        = 0
WHERE 1=1
  AND cod_produto   = {cod_produto}
  AND cod_lote      = {cod_lote}
  AND cod_embalagem = {cod_embalagem}
  AND cod_deposito  = {cod_deposito}
  AND localizacao   = {localizacao}
;


-- Limpa possível cadastro anterior
DELETE FROM cv_plano_corte_plan WHERE cod_plano_corte = {cod_plano_corte};



-- Cadastra CADA PEÇA que será cortada
-- * Retetir a parte de VALUES para cada PEÇA CORTADA
--   cod_plano_corte : Código do Plano de Corte gerado no sistema
--   cod_rolo        : Código do Rolo de Origem ( Lote + Embalagem + Nr Série )
--   cod_op          : Código da Ordem de Produção
--   cod_op_pc       : Nº sequencial da pç na OP ( Se forem 10 pçs: vai de 1 até 10 )
--   largura         : largura desta peça em mm
--   comprimento     : comprimento desta peça em mm
--   m2              : Área desta peça em m² ( comprimento/1.000 x largura/1.000 ) = comprimento x largura / 1.000.000
--   x0              : Posição Inicial em X da Peça no rolo [ mm ]
--   x1              : Posição Final em X da peça no rolo [ mm ]
--   y0              : Posição Inicial em Y da peça no rolo [ mm ]
--   y1              : Posição Final em Y da peça no rolo [ mm ]
--   cod_produto     : Código da Matéria Prima do Rolo (será usado para agilizar as queries)
--
-- Cada PEÇA recebe todo o espaço entre parênteses de VALUES, faz um único INSERT para todas as peças
-- Os parênteses são separados por vírgula
-- Ex. para as peças 1 e 2 da OP 387:
--    ( 1, 4, 387, 1, 1000, 200, 0.2000, 1250, 2250, 3100, 3300, '268', 'PECA' ),
--    ( 1, 4, 387, 2, 1000, 200, 0.2000, 1250, 2250, 3100, 3300, '268', 'PECA' )
--
-- Precisa definir o uso da peça através do Nº de Série:
--   PECA   : Peça gerada em OP
--   SUCATA : OP -1 (OP cód menos um)
--   CORTE  : OP 0 (OP cód zero) -> Vai gerar OUTRO rolo
--
INSERT INTO cv_plano_corte_plan
       (   cod_plano_corte,   cod_rolo,   cod_empresa,   cod_op,   cod_op_pc,   largura,   comprimento,   m2,   x0,   x1,   y0,   y1,   cod_produto  ,   nr_serie   )
VALUES {VALUES_PECAS}
;



-- --------------------------------------------------------
-- Atualiza situação da OP p/ "Em Produção"
UPDATE pp_ordem_producao op
LEFT JOIN cv_plano_corte_plan plan ON
  plan.cod_empresa = op.cod_empresa AND
  plan.cod_op     = op.cod_op
SET
  op.situacao        = 20,
  op.cod_lote        = op.cod_op,
  op.cod_plano_corte = {cod_plano_corte} -- Adicionado 'op.' antes da coluna
WHERE
  plan.cod_plano_corte = {cod_plano_corte} -- Adicionado 'plan.' antes da coluna
;



-- --------------------------------------------------------
-- Movimenta o Estoque do Rolo
--
--          SAÍDA
INSERT INTO eq_movto_estoque
  (
    un, cod_colaborador, cod_plano_corte,
    cod_produto, cod_lote, cod_embalagem, nr_serie,
    cod_empresa, cod_deposito, localizacao,
    tp_movimento, quantidade, dt_movimento, descricao
  )
  SELECT
    'M2', -- un
    {cod_colaborador}, -- Colaborador da Sessão
    {cod_plano_corte}, -- Código do Plano de Corte

    saldo.cod_produto,
    saldo.cod_lote,
    saldo.cod_embalagem,
    saldo.nr_serie,

    saldo.cod_empresa,
    saldo.cod_deposito,
    saldo.localizacao,

    20,    -- Tp Movto: Saída
    saldo.saldo_estoque, -- Quantidade
    NOW(), -- Dt Movimento
    'Saída para atender Plano de Corte {cod_plano_corte}' -- Descricao

  FROM cv_plano_corte_plan plan
  LEFT JOIN cv_rolo rolo ON
    rolo.cod_rolo = plan.cod_rolo
  LEFT JOIN eq_saldo saldo ON
    saldo.cod_empresa   = plan.cod_empresa AND
    saldo.cod_produto   = rolo.cod_produto AND
    saldo.cod_lote      = rolo.cod_lote    AND
    saldo.cod_embalagem = rolo.cod_embalagem
  WHERE
    plan.cod_plano_corte = {cod_plano_corte}
  GROUP BY rolo.cod_rolo
;
--
--         ENTRADA
INSERT INTO eq_movto_estoque
  (
    un, cod_colaborador, cod_plano_corte,
    cod_produto, cod_lote, cod_embalagem, nr_serie,
    cod_empresa, cod_deposito, localizacao,
    tp_movimento, quantidade, dt_movimento, descricao
  )
  SELECT
    'M2', -- un
    {cod_colaborador}, -- Colaborador da Sessão
    {cod_plano_corte}, -- Código do Plano de Corte

    saldo.cod_produto,
    saldo.cod_lote,
    saldo.cod_embalagem,
    saldo.nr_serie,

    saldo.cod_empresa,
    (
      SELECT
      COALESCE( valor, ( SELECT def_valor FROM cd_parametro WHERE nome_param = 'codDepositoLiberaProducao' ) ) AS deposito
      FROM cd_param_empresa
      WHERE 1=1
        AND cod_empresa = saldo.cod_empresa
        AND nome_param  = 'codDepositoLiberaProducao'
    ),
    saldo.localizacao,

    10,    -- Tp Movto: Entrada
    saldo.saldo_estoque, -- Quantidade
    NOW(), -- Dt Movimento
    'Entra no Depósito de Produção para atender Plano de Corte {cod_plano_corte}' -- Descricao

  FROM cv_plano_corte_plan plan
  LEFT JOIN cv_rolo rolo ON
    rolo.cod_rolo = plan.cod_rolo
  LEFT JOIN eq_saldo saldo ON
    saldo.cod_empresa   = plan.cod_empresa AND
    saldo.cod_produto   = rolo.cod_produto AND
    saldo.cod_lote      = rolo.cod_lote    AND
    saldo.cod_embalagem = rolo.cod_embalagem
  WHERE
    plan.cod_plano_corte = {cod_plano_corte}
  GROUP BY rolo.cod_rolo
;
--
--
-- Atualiza    eq_saldo
--   * Muda p/ Depósito de Produção e localização vazia
--   * Atualiza o Plano de Corte
--   * Atualiza a situação para 20
UPDATE eq_saldo saldo
JOIN (
    SELECT DISTINCT
        rolo.cod_empresa,
        rolo.cod_produto,
        rolo.cod_lote,
        rolo.cod_embalagem,
        rolo.cod_rolo
    FROM cv_rolo rolo
    JOIN cv_plano_corte_plan plan 
        ON plan.cod_rolo = rolo.cod_rolo
    WHERE plan.cod_plano_corte = {cod_plano_corte}
  ) x ON
      x.cod_empresa   = saldo.cod_empresa
  AND x.cod_produto   = saldo.cod_produto
  AND x.cod_lote      = saldo.cod_lote
  AND x.cod_embalagem = saldo.cod_embalagem

SET 
  saldo.cod_deposito = (
      SELECT
        COALESCE(
          valor,
          ( SELECT def_valor FROM cd_parametro WHERE nome_param = 'codDepositoLiberaProducao' )
        )
      FROM cd_param_empresa
      WHERE cod_empresa = saldo.cod_empresa
        AND nome_param  = 'codDepositoLiberaProducao'
  ),
  saldo.localizacao     = '',
  saldo.cod_plano_corte = {cod_plano_corte},
  saldo.situacao        = 20
;



