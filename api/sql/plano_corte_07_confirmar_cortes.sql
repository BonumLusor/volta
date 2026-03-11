-- ----------------------------------------------------------------------------
-- Confirmar Corte
--
-- --------------------------------------------------------
--
-- * Cód Colaborador que Confirmou o Corte
--
-- --------------------------------------------------------
--
-- * Código do Produto que será cortado
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
--
-- Atualiza Plano de Corte - CONFIRMA O CORTE
--
-- --------------------------------------------------------
UPDATE cv_plano_corte
SET cod_colaborador_update = {cod_colaborador}, updated_at = NOW(), situacao = 20
WHERE cod_plano_corte = {cod_plano_corte}
;


-- Cadastra CADA PEÇA que FOI cortada
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
--   cod_lote        : lote foi gerado no Recebimento
--
--   *** Atenção com a EMBALAGEM ***
--   cod_embalagem   : Usar o campo ultima_embalagem_do_lote e ADICIONAR 1 em cada peça cortada
--
-- Cada PEÇA recebe todo o espaço entre parênteses de VALUES, faz um único INSERT para todas as peças
-- Os parênteses são separados por vírgula
-- Ex. para as peças 1 e 2 da OP 387:
--    ( 1, 4, 387, 1, 1000, 200, 0.2000, 1250, 2250, 3100, 3300, '268', 'PECA' ),
--    ( 1, 4, 387, 2, 1000, 200, 0.2000, 1250, 2250, 3100, 3300, '268', 'PECA' )
--
-- Precisa definir o uso da peça através do Nº de Série:
--   PECA    : Peça gerada em OP
--   SUCATA  : OP -1 (OP cód menos um)
--   CORTADO : OP 0 (OP cód zero) -> Vai gerar OUTRO rolo
--
INSERT INTO cv_plano_corte_real
       (   cod_plano_corte,   cod_rolo,   cod_empresa,  cod_op,   cod_op_pc,   largura,   comprimento,   m2,   x0,   x1,   y0,   y1,   cod_produto  ,   cod_lote,   cod_embalagem,   nr_serie   )
VALUES ( {cod_plano_corte}, {cod_rolo}, {cod_empresa}, {cod_op}, {cod_op_pc}, {largura}, {comprimento}, {m2}, {x0}, {x1}, {y0}, {y1}, '{cod_produto}', {cod_lote}, {cod_embalagem}, '{nr_serie}' )
;




-- Gera a Embalagem de cada Peça no depósito de Material em Transformação
INSERT INTO eq_saldo (
    cod_empresa, cod_deposito,
    cod_produto, cod_lote, cod_embalagem, nr_serie,
    dt_validade, dt_producao, cod_plano_corte,
    saldo_estoque, descricao
  )
  SELECT
    corte.cod_empresa,
    -- Insere no depósito de Material em Transformação, na OP
    (SELECT
       COALESCE( valor,
         ( SELECT def_valor FROM cd_parametro WHERE nome_param = 'codDepositoLiberaProducao' )
       )
     FROM cd_param_empresa
     WHERE cod_empresa = corte.cod_empresa AND nome_param  = 'codDepositoLiberaProducao'
    ),

  corte.cod_produto, corte.cod_lote, corte.cod_embalagem, corte.nr_serie,
  rolo.dt_validade, NOW(), {cod_plano_corte},
  corte.m2, CONCAT( 'Cortado pela OP ', corte.cod_op )

FROM cv_plano_corte_real corte
LEFT JOIN cv_rolo rolo ON corte.cod_rolo = rolo.cod_rolo
WHERE corte.cod_plano_corte = {cod_plano_corte}
;





-- --------------------------------------------------------
-- Atualiza Depósito e o Saldo do Rolo em eq_saldo
--
UPDATE eq_saldo saldo
JOIN (
    SELECT
      rolo.cod_empresa,
      rolo.cod_deposito,
      rolo.localizacao,

      rolo.cod_produto,
      rolo.cod_lote,
      rolo.cod_embalagem,
      rolo.cod_rolo,

      SUM( corte.m2 ) AS qtd_cortada
    FROM cv_rolo rolo
    JOIN cv_plano_corte_real corte
        ON corte.cod_rolo = rolo.cod_rolo
    WHERE corte.cod_plano_corte = 1
    GROUP BY rolo.cod_rolo
  ) x ON
      x.cod_empresa   = saldo.cod_empresa
  AND x.cod_produto   = saldo.cod_produto
  AND x.cod_lote      = saldo.cod_lote
  AND x.cod_embalagem = saldo.cod_embalagem

SET 
  saldo.cod_deposito    = x.cod_deposito,
  saldo.localizacao     = x.localizacao,
  saldo.saldo_estoque   = ( saldo.saldo_estoque - x.qtd_cortada),
  saldo.cod_plano_corte = null,
  saldo.situacao        = 0,
  saldo.nr_serie        = 'CORTADO'

WHERE 1=1
  AND saldo.cod_empresa   = x.cod_empresa
  AND saldo.cod_produto   = x.cod_produto
  AND saldo.cod_lote      = x.cod_lote
  AND saldo.cod_embalagem = x.cod_embalagem
;





-- ----------------------------------------------------------------------------
-- Reporta a Operação da OP
INSERT INTO pp_ordem_producao_reporte reporte (
  cod_empresa, cod_op, cod_lote, situacao, cod_operacao, cod_reporte,
  qtd_reportada, qtd_embalagem,
  dt_inicio, dt_termino, dt_implant, cod_linha, cod_colaborador,
  cod_deposito, localizacao
)
SELECT
  corte.cod_empresa,
  corte.cod_op,
  corte.cod_op,
  20 AS situacao,
  1 AS cod_operacao, -- SEMPRE 1
  (
    SELECT ( MAX( COALESCE( rep.cod_reporte, 0 ) ) + 1 )
    FROM pp_ordem_producao_reporte rep
    WHERE rep.cod_empresa = corte.cod_empresa
      AND rep.cod_op      = corte.cod_op
  ) AS cod_reporte,

  COUNT( corte.cod_embalagem ) AS qtd_reportada,
  COUNT( corte.cod_embalagem ) AS qtd_embalagem,

  NOW() AS dt_inicio,
  NOW() AS dt_termino,
  NOW() AS dt_implant,
  1 AS cod_linha,
  {cod_colaborador} AS cod_colaborador,

  (SELECT
      COALESCE( valor,
        ( SELECT def_valor FROM cd_parametro WHERE nome_param = 'codDepositoLiberaProducao' )
      )
    FROM cd_param_empresa
    WHERE cod_empresa = corte.cod_empresa AND nome_param  = 'codDepositoLiberaProducao'
  ) AS cod_deposito, -- Depósito de Material em Transformação
  '' AS localizacao  -- SEM Localização

-- Plano Corte Real
FROM cv_plano_corte_real corte

-- OP
LEFT JOIN pp_ordem_producao op ON
  op.cod_empresa = corte.cod_empresa AND
  op.cod_op      = corte.cod_op

WHERE corte.cod_plano_corte = {cod_plano_corte}
  AND corte.cod_op          > 0 -- Corte vinculado à uma OP

GROUP BY
  op.cod_empresa,
  op.cod_op
;



-- ----------------------------------------------------------------------------
-- Reporta os componentes da Operação
INSERT INTO pp_ordem_producao_componente componente (
  cod_empresa, cod_op, cod_reporte, nr_sequencia_componente,
  cod_produto, cod_lote, cod_embalagem, nr_serie, qtd,
  cod_deposito, localizacao
)
SELECT
  corte.cod_empresa,
  corte.cod_op,
  (
    SELECT MAX( reporte.cod_reporte )
    FROM pp_ordem_producao_reporte reporte
    WHERE reporte.cod_empresa = corte.cod_empresa
      AND reporte.cod_op      = corte.cod_op
  ) AS cod_reporte,
  corte.cod_embalagem AS nr_sequencia_componente,

  corte.cod_produto   AS cod_produto,   -- Ainda é o Rolo => Muda para o Cód do Produto da OP quando Finaliza a OP
  corte.cod_lote      AS cod_lote,      -- Lote do Rolo
  corte.cod_embalagem AS cod_embalagem, -- Cada Peça é uma Embalagem
  'PECA'              AS nr_serie,
  1                   AS qtd, -- Cada peça é uma embalagem

  (SELECT
      COALESCE( valor,
        ( SELECT def_valor FROM cd_parametro WHERE nome_param = 'codDepositoLiberaProducao' )
      )
    FROM cd_param_empresa
    WHERE cod_empresa = corte.cod_empresa AND nome_param  = 'codDepositoLiberaProducao'
  ) AS cod_deposito, -- Depósito de Material em Transformação
  '' AS localizacao  -- SEM Localização

-- Plano Corte Real
FROM cv_plano_corte_real corte

-- OP
LEFT JOIN pp_ordem_producao op ON
  op.cod_empresa = corte.cod_empresa AND
  op.cod_op      = corte.cod_op

WHERE corte.cod_plano_corte = {cod_plano_corte}
  AND corte.cod_op          > 0 -- Corte vinculado à uma OP

GROUP BY corte.cod_peca_real -- Cada peça cortada do Rolo
;


