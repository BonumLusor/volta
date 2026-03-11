-- ----------------------------------------------------------------------------
-- Criar Novo Plano de Corte
--
-- --------------------------------------------------------
-- * Cód Colaborador que cadastrou o Plano
-- --------------------------------------------------------
-- * Código do Produto que será cortado
-- --------------------------------------------------------
-- * Situação do Plano de Corte
--     0 : Gerado (sem nada planejado ainda)
--    10 : Planejado
--    20 : Cortado
--    90 : Cancelado
-- --------------------------------------------------------
-- Memorizar em sessão cod_plano_corte Ativo, que foi gerado na tabela
-- ----------------------------------------------------------------------------
INSERT INTO cv_plano_corte
       (   cod_produto,   cod_colaborador, created_at, cod_colaborador_update, updated_at, situacao,   dt_comprometida_pv   )
VALUES ( {cod_produto}, {cod_colaborador},      NOW(),      {cod_colaborador},      NOW(),        0, '{dt_comprometida_pv}' )
;


-- --------------------------------------------------------
-- Reserva o Rolo em eq_saldo
-- Fazer isso para cada rolo selecionado
UPDATE eq_saldo
SET
  cod_plano_corte = {cod_plano_corte},
  situacao        = 20
WHERE 1=1
  AND cod_produto   = {cod_produto}
  AND cod_lote      = {cod_lote}
  AND cod_embalagem = {cod_embalagem}
  AND cod_deposito  = {cod_deposito}
  AND localizacao   = {localizacao}
;
