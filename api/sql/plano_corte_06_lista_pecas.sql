-- ----------------------------------------------------------------------------
--
-- Lista todas as peças do Plano de Corte , que estão Planejadas para corte
--
SELECT
  rolo.cod_rolo,
  rolo.cod_produto,
  rolo.cod_lote,
  rolo.cod_embalagem,

  rolo.ultima_embalagem_do_lote,

  plan.cod_empresa,
  plan.cod_op,
  plan.cod_op_pc,

  plan.largura,
  plan.comprimento,
  plan.m2,

  plan.x0,
  plan.x1,

  plan.y0,
  plan.y1

FROM cv_plano_corte_plan plan
LEFT JOIN cv_rolo rolo ON
  rolo.cod_rolo = plan.cod_rolo
WHERE cod_plano_corte = {cod_plano_corte}
ORDER BY
  cod_rolo  ASC,
  cod_op    ASC,
  cod_op_pc ASC
;
