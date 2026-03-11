-- ----------------------------------------------------------------------------
-- CANCELAR Plano de Corte
--
-- --------------------------------------------------------
-- * Cód Colaborador que cadastrou o Plano
-- --------------------------------------------------------
-- * Código do Produto que será cortado
-- --------------------------------------------------------
-- * Situação do Plano de Corte
--    10 : Planejado
--    20 : Cortado
--    90 : Cancelado
-- --------------------------------------------------------
-- Memorizar em sessão cod_plano_corte Ativo, que foi gerado na tabela
-- ----------------------------------------------------------------------------
UPDATE cv_plano_corte
SET cod_colaborador_update = {cod_colaborador}, updated_at = NOW(), situacao = 90
WHERE cod_plano_corte = {cod_plano_corte}
;


-- --------------------------------------------------------
-- Libera o Rolo em eq_saldo
UPDATE eq_saldo
SET
  cod_plano_corte = null,
  situacao        = 0
WHERE cod_plano_corte = {cod_plano_corte}
;
