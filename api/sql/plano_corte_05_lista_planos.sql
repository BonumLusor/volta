SELECT
  corte.cod_plano_corte,
  corte.cod_produto,
  prod.desc_comercial AS nome_produto,
  corte.dt_comprometida_pv

FROM cv_plano_corte corte

LEFT JOIN cd_produto prod ON
  prod.cod_produto = corte.cod_produto

WHERE
  corte.situacao = 10
;
