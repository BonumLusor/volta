-- --------------------------------------------------------
-- Produto Selecionado na tela anterior
--
      SET @codProduto = '268'; -- '{codProduto)'
--
-- --------------------------------------------------------


-- --------------------------------------------------------
-- Atualiza cv_rolo caso o intem entrou em estoque 
-- fora do Recebimento
-- --------------------------------------------------------
INSERT INTO cv_rolo
  (
    cod_produto,
    cod_lote,
    cod_embalagem,
    nr_serie,

    cod_empresa,
    cod_deposito,
    localizacao,

    qtd,

    largura,
    comprimento,

    dt_validade,
    ultima_embalagem_do_lote
  )
  SELECT
    -- Cada ROLO
    saldo.cod_produto,
    saldo.cod_lote,
    saldo.cod_embalagem,
    saldo.nr_serie,

    -- Onde está o rolo
    saldo.cod_empresa,
    saldo.cod_deposito,
    saldo.localizacao,

    -- Disponível
    saldo.saldo_estoque,

    -- Dimensões do rolo novo
    prod.largura,
    prod.comprimento,

    -- Data de Validade
    saldo.dt_validade,

    -- ÚLTIMA EMBALAGEM DO LOTE
    CASE
      WHEN 
        (
          SELECT MAX( cod_embalagem )
          FROM eq_saldo
          WHERE
            eq_saldo.cod_produto = saldo.cod_produto AND
            eq_saldo.cod_lote    = saldo.cod_lote
        ) > rolo.ultima_embalagem_do_lote
        THEN (
            SELECT MAX( cod_embalagem )
            FROM eq_saldo
            WHERE
              eq_saldo.cod_produto = saldo.cod_produto AND
              eq_saldo.cod_lote    = saldo.cod_lote
          )
        ELSE rolo.ultima_embalagem_do_lote
    AS ultima_embalagem_do_lote

  -- ----------------------------------------------
  -- Saldo em estoque AGORA
  FROM eq_saldo saldo

  LEFT JOIN cd_produto prod ON
    prod.cod_produto = saldo.cod_produto

  LEFT JOIN cv_rolo rolo ON
    rolo.cod_produto   = saldo.cod_produto AND
    rolo.cod_lote      = saldo.cod_lote    AND
    rolo.cod_embalagem = saldo.cod_embalagem

  -- Depósito -> Considera na Produção
  LEFT JOIN eq_deposito dep ON
    dep.cod_empresa  = saldo.cod_empresa AND
    dep.cod_deposito = saldo.cod_deposito

  -- ----------------------------------------------
  WHERE 1=1
    -- Depósitos usados na Produção
    AND dep.ind_producao = 1
 
    -- DESCONSIDERA quem está cortando
    -- Situacao 
    --     0 : Livre
    --    10 : Reservado OPO
    --    20 : Reservado Corte
    AND saldo.situacao != 20

    -- Considera APENAS nr série vazio e cortado
    AND saldo.nr_serie IN ( NULL, '', 'CORTADO' )

    -- Código do Produto Selecionado no passo 2
    AND saldo.cod_produto = @codProduto

  -- ----------------------------------------------
  GROUP BY
    -- Cada linha de eq_saldo
    saldo.cod_produto,
    saldo.cod_lote,
    saldo.cod_embalagem,
    saldo.cod_deposito,
    saldo.localizacao

  ON DUPLICATE KEY UPDATE
    nr_serie     = VALUES( nr_serie ),
    qtd          = VALUES( qtd ),
    comprimento  = VALUES( comprimento ),
    largura      = VALUES( largura ),
    ultima_embalagem_do_lote = VALUES( ultima_embalagem_do_lote ),
    cod_empresa  = VALUES( cod_empresa ),
    cod_deposito = VALUES( cod_deposito ),
    localizacao  = VALUES( localizacao )
;



-- --------------------------------------------------------
--
--   Insere a Data de Validade, se ainda não
--   estiver cadastrada
--
-- --------------------------------------------------------
UPDATE cv_rolo rolo
LEFT JOIN (
  SELECT 
    cod_produto,
    cod_lote,
    cod_embalagem,
    MIN(dt_validade) AS dt_validade
  FROM eq_saldo
  WHERE dt_validade > '1900-01-01'
  GROUP BY 
    cod_produto,
    cod_lote,
    cod_embalagem
) saldo ON
    saldo.cod_produto   = rolo.cod_produto AND
    saldo.cod_lote      = rolo.cod_lote    AND
    saldo.cod_embalagem = rolo.cod_embalagem
SET rolo.dt_validade =
CASE
    WHEN rolo.dt_validade > '1900-01-01' THEN rolo.dt_validade
    ELSE saldo.dt_validade
END
WHERE 1=1
  AND rolo.qtd > 0
  AND rolo.cod_produto = @codProduto
;



-- --------------------------------------------------------
--                                                       --
--            Lista o saldo disponível da                --
--             Matéria Prima selecionada                 --
--                                                       --
-- --------------------------------------------------------
SELECT
  -- Onde está o produto
  saldo.cod_empresa,
  saldo.cod_deposito,
  saldo.localizacao,


  -- Situação do Rolo
  --    0 : Livre
  --   10 : Reservado OPO
  --   20 : Reservado Corte
  --      => Situação 20 é apresentada em VERMELHO na Tela
  --      e NÂO pode ser selecionada: É apenas INFORMATIVO
  saldo.situacao,
  CASE
    WHEN saldo.situacao =  0 THEN 'Livre' -- Verde
    WHEN saldo.situacao = 10 THEN 'Reservado OPO'   -- Amarelo
    WHEN saldo.situacao = 20 THEN 'Reservado Corte' -- Vermelho
  END AS nome_situacao,


  -- Matéria Prima
  saldo.cod_produto,
  prod.desc_comercial AS produto,
  saldo.cod_lote,
  saldo.cod_embalagem,
  saldo.nr_serie,
  rolo.cod_rolo,

  -- Disponível
  saldo.dt_validade,
  saldo.saldo_estoque,
  prod.un,


  -- Onde está
  saldo.cod_deposito,
  saldo.localizacao

-- ----------------------------------------------
-- Saldo em estoque AGORA
FROM eq_saldo saldo

-- Depósito -> Considera na Produção
LEFT JOIN eq_deposito dep ON
  dep.cod_empresa  = saldo.cod_empresa AND
  dep.cod_deposito = saldo.cod_deposito

-- Rolo
LEFT JOIN cv_rolo rolo ON
  rolo.cod_produto   = saldo.cod_produto AND
  rolo.cod_lote      = saldo.cod_lote    AND
  rolo.cod_embalagem = saldo.cod_embalagem

-- Produto
LEFT JOIN cd_produto prod ON
  prod.cod_produto = saldo.cod_produto

-- ----------------------------------------------
WHERE 1=1
  -- Depósitos usados na Produção
  AND dep.ind_producao = 1

  -- Considera APENAS nr série vazio e cortado
  AND saldo.nr_serie IN ( NULL, '', 'CORTADO', 'CORTE' )

  -- Código do Produto Selecionado no passo 2
  AND saldo.cod_produto = @codProduto

-- ----------------------------------------------
GROUP BY
  -- Cada linha de eq_saldo
  saldo.cod_produto,
  saldo.cod_lote,
  saldo.cod_embalagem,
  saldo.cod_deposito,
  saldo.localizacao

ORDER BY
  saldo.situacao      ASC,
  prod.desc_comercial ASC,
  saldo.dt_validade   ASC
;




-- --------------------------------------------------------
--                                                       --
--     Lista as OP da Matéria Prima selecionada          --
--                                                       --
-- --------------------------------------------------------
SELECT
  -- Pedido
  op.cod_empresa,
  op.cod_pedido,

  -- OP
  op.cod_empresa       AS cod_empresa_op,
  op.cod_op            AS cod_op,

  -- Qtd a ser fabricada pela OP
  -- Cada unidade aqui representa uma peça a ser cortada
  -- Se qtd = 10 => Serão cortadas 10 pçs com a largura e o comprimento
  ROUND( op.qtd )      AS op_qtd_total_a_ser_fabricada,

  -- Produto Fabricado pela OP
  prodf.desc_comercial AS prod_fabricado,
  prodf.un             AS prod_fabricado_un,
	

  -- Comprimento e largura do Produto Fabricado pela OP
  -- Tamanho de cada retângulo cortado
  -- Lembrar que na tela é para apresentar: Largura e Comprimento ( nesta ordem !!! )
  -- Correias Volta usa na sequência contrária do mercado e isso já é cultura interna
  COALESCE( ROUND( SQRT( 3 * mp.qtd * 1000000)/ 3 ),  90 ) AS prod_fabricado_largura,
  COALESCE( ROUND( SQRT( 3 * mp.qtd * 1000000)/ 1 ), 950 ) AS prod_fabricado_comprimento,

  -- Quando os produtos estiverem cadastrados, usaremos estas duas linhas para compr e larg
  -- prodf.largura     AS prod_fabricado_largura,
  -- prodf.comprimento AS prod_fabricado_comprimento,
  
  -- Matéria Prima da OP
  mp.cod_produto      AS componente_cod,
  prod.desc_comercial AS componente_nome,
  prod.un             AS componente_un,

  -- Quantidade do Componente usada para fabricar uma unidade
  -- do produto fabricado
  mp.qtd              AS qtd_componente_fabricar_1_prod_fabricado_m2,
  mp.qtd * 1000000    AS qtd_componente_fabricar_1_prod_fabricado_mm2,

  -- Datas
  DATE( op.dt_previsao_termino     ) AS dt_previsao_termino_op,
  DATE( pv.dt_entrega_comprometida ) AS dt_comprometida_pv

-- OP
FROM pp_ordem_producao op

-- Produto Fabricado pela OP
LEFT JOIN cd_produto prodf ON
  prodf.cod_produto = op.cod_produto

-- Componente da OP : Matéria Prima
LEFT JOIN pp_ordem_producao_estrutura mp ON
  mp.cod_empresa = op.cod_empresa AND
  mp.cod_op      = op.cod_op

-- Cadastro do Componente
LEFT JOIN cd_produto prod ON
  prod.cod_produto = mp.cod_produto

-- Pedido de Venda
LEFT JOIN vd_pedido pv ON
  pv.cod_empresa = op.cod_empresa AND
  pv.cod_pedido  = op.cod_pedido

WHERE 1=1

  -- OP Liberada
  AND op.situacao = 10

  -- Filtra a Matéria Prima Selecionada
  AND mp.cod_produto = @codProduto

GROUP BY
  mp.cod_empresa,
  mp.cod_op,
  mp.cod_produto_pai,
  mp.cod_produto

ORDER BY
  COALESCE( DATE( pv.dt_entrega_comprometida ) , DATE( op.dt_previsao_termino     ) ) ASC,
  prodf.desc_comercial ASC
-- --------------------------------------------------------
-- Limitando AGORA para termos dados por mais tempo     --
--            APAGAR QUANDO ENTRAR EM PRODUÇÃO          --
LIMIT 25
-- --------------------------------------------------------
;
