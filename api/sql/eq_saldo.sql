SELECT
  -- Matéria Prima
  saldo.cod_produto,
  prod.desc_comercial AS produto,
  saldo.cod_lote,
  saldo.cod_embalagem,
  saldo.nr_serie,

  -- Disponível
  saldo.dt_validade,
  saldo.saldo_estoque,
  prod.un,

  -- GATO ! ! ! ! ! !
  -- Forma que achei de enciar alguma informação até conseguirmos popular a tabela cv_rolo
  1000 AS largura,
  saldo.saldo_estoque * 1000 AS comprimento,

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

-- Produto
LEFT JOIN cd_produto prod ON
  prod.cod_produto = saldo.cod_produto


-- ----------------------------------------------
WHERE 1=1
  -- Depósitos usados na Produção
  AND dep.ind_producao = 1

  -- Considera APENAS nr série vazio e cortado
  AND saldo.nr_serie IN ( NULL, '', 'CORTADO' )

  -- Código do Produto Selecionado no passo 2
  AND saldo.cod_produto = {cod_produto} -- {cod_produto}

-- ----------------------------------------------
GROUP BY
  -- Cada linha de eq_saldo
  saldo.cod_produto,
  saldo.cod_lote,
  saldo.cod_embalagem,
  saldo.cod_deposito,
  saldo.localizacao

ORDER BY
  produto ASC,
  cod_produto ASC,
  saldo.dt_validade ASC

;
