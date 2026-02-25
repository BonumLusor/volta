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
  op.cod_op            AS op_cod,

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
  COALESCE( ROUND( SQRT( 3 * mp.qtd * 1000000)/ 1 ), 950 ) AS prod_fabricado_comprimento,
  COALESCE( ROUND( SQRT( 3 * mp.qtd * 1000000)/ 3 ),  90 ) AS prod_fabricado_largura,

  -- Quando os produtos estiverem cadastrados, usaremos estas duas linhas para compr e larg
  -- prodf.comprimento AS prod_fabricado_comprimento,
  -- prodf.largura     AS prod_fabricado_largura,
  
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
  AND mp.cod_produto = {cod_produto}

GROUP BY
  mp.cod_empresa,
  mp.cod_op,
  mp.cod_produto_pai,
  mp.cod_produto

-- --------------------------------------------------------
-- Limitando AGORA para termos dados por mais tempo     --
--            APAGAR QUANDO ENTRAR EM PRODUÇÃO          --
LIMIT 25
-- --------------------------------------------------------
;


