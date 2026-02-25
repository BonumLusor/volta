-- Inicia a "tabela temporária virtual" (CTE)
WITH _op AS (
    SELECT
      -- Pedido
      op.cod_empresa,
      op.cod_pedido,

      -- OP
      op.cod_op,
      
      -- Matéria Prima da OP
      mp.cod_produto      AS cod_produto,
      prod.desc_comercial AS nome_produto,

      -- Valida Quantidade em m²
      mp.qtd,
      prod.un,

      -- Datas
      DATE(op.dt_previsao_termino)      AS dt_previsao_termino_op,
      DATE(pv.dt_entrega_comprometida)  AS dt_comprometida

    FROM pp_ordem_producao op

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

    WHERE 
      -- OP Liberada
      op.situacao = 10
      -- Produto com unidade de medida em M²
      AND prod.un IN ( 'm2', 'M2', 'm²' )

    GROUP BY
      mp.cod_empresa,
      mp.cod_op,
      mp.cod_produto_pai,
      mp.cod_produto
)

-- Seleção Final usando a CTE acima
SELECT
  cod_produto,
  nome_produto,
  MIN( dt_comprometida ) AS dt_entrega_comprometida,
  GROUP_CONCAT(
    DISTINCT cod_pedido
    ORDER BY cod_pedido ASC
    SEPARATOR ', '
  ) AS cod_pedido

FROM _op
GROUP BY cod_produto
ORDER BY
  dt_entrega_comprometida ASC,
  nome_produto ASC;