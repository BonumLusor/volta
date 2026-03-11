<template>
    <div class="erp-container">
        <div class="erp-content">
            <header class="erp-header">
                <div class="title-group">
                    <h1 class="erp-title">Configuração de Lote de Corte</h1>
                    <p class="erp-subtitle">Selecione as matérias-primas e as ordens de produção para o plano.</p>
                </div>

                <button class="btn-primary" :disabled="!podeConfirmar" @click="confirmarEIrParaCorte">
                    Selecionar OP's ({{ resumoSelecao }})
                </button>
            </header>

            <div class="">
                <!-- Coluna de Rolos -->
                <section class="column card">
                    <div class="card-header">
                        <h2 class="card-title">1. Materiais (Rolos)</h2>
                        <span class="count-badge">{{ materialSelecionado ? 1 : 0 }}</span>
                    </div>
                    <div class="card-body no-padding scroll-area">
                        <table class="erp-table">
                            <thead>
                                <tr>
                                    <th>Seleção</th>
                                    <th>Material</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="material in materiais" :key="material.cod_produto"
                                    :class="{ selected: materialSelecionado?.cod_produto === material.cod_produto }"
                                    @click="toggleRolo(material)">
                                    <td class="text-center">
                                        <input type="checkbox"
                                            :checked="materialSelecionado?.cod_produto === material.cod_produto"
                                            @click.stop="toggleRolo(material)" />
                                    </td>
                                    <td><strong>{{ material.nome_produto }} (cod: {{ material.cod_produto }})</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' // Adicione onMounted se quiser garantir execução na montagem
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. Torne a variável REATIVA
const materiais = ref<any[]>([])

// Estados de Seleção
const materialSelecionado = ref<any>(null)

// Buscando os dados
fetch('https://volta.automaportal.com.br/api/mysql/pp_op_liberada')
    .then(response => response.json())
    .then(data => {
        // 2. Use .value para atualizar a variável reativa
        materiais.value = data
        console.log('Materiais carregados:', data)
    })
    .catch(error => console.error('Erro ao buscar dados:', error))

// Lógica de UI
const podeConfirmar = computed(() => materialSelecionado.value !== null)
const resumoSelecao = computed(() => materialSelecionado.value ? '1 Selecionado' : 'Nenhum')

const toggleRolo = (rolo: any) => {
    // Se clicar no que já está selecionado, desmarca (vira null)
    if (materialSelecionado.value?.cod_produto === rolo.cod_produto) {
        materialSelecionado.value = null
    } else {
        // Se clicar em outro, substitui o atual pelo novo
        materialSelecionado.value = rolo
    }
}

const confirmarEIrParaCorte = () => {
    const payload = {
        materiais: [materialSelecionado.value]
    }

    if (typeof window !== 'undefined') {
        localStorage.setItem('planoCorte', JSON.stringify(payload))
    }

    router.push({
        path: '/rolos',
        state: { material: payload }
    })
}
</script>

<style scoped>
.erp-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 20px;
}

.erp-content {
    max-width: 1200px;
    margin: 0 auto;
}

.erp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background: white;
    padding: 20px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
}

.erp-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #001f3f;
    margin: 0;
}

.erp-subtitle {
    font-size: 0.9rem;
    color: #666;
    margin: 5px 0 0 0;
}

.main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

/* Cards */
.card {
    background: white;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
}

.card-header {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    color: #444;
}

.card-body.no-padding {
    padding: 0;
}

.scroll-area {
    max-height: 60vh;
    overflow-y: auto;
}

/* Table */
.erp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.erp-table th {
    background: #f8f9fa;
    text-align: left;
    padding: 12px 15px;
    border-bottom: 2px solid #dee2e6;
    color: #666;
}

.erp-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
}

.erp-table tr:hover {
    background-color: #fcfcfc;
    cursor: pointer;
}

.erp-table tr.selected {
    background-color: #fff4ed;
}

.text-center {
    text-align: center;
}

/* Status Tags */
.status-tag {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    text-transform: uppercase;
}

.status-tag.occupied {
    background: #fee2e2;
    color: #dc3545;
}

.status-tag.available {
    background: #dcfce7;
    color: #15803d;
}

/* Buttons */
.btn-primary {
    background-color: #001f3f;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background-color: #003366;
}

.btn-primary:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.count-badge {
    background: #f37021;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
}
</style>
