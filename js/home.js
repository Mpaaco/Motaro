import { getEmAndamentoCount, getAllRecords, getAllClients, updateRecordStatus, updateRecordPagamento } from './utils/api.js';

const BASE = '/api';

async function getClientByCpf(cpf) {
    const res = await fetch(`${BASE}/clients/${encodeURIComponent(cpf)}`);
    if (!res.ok) return null;
    return res.json();
}

function buildStatusTag(record) {
    const cls = record.status === 'Finalizado' ? 'finalizado' : 'em-andamento';
    return `<button class="status-tag ${cls}" data-id="${record._id}" data-status="${record.status}">${record.status}</button>`;
}

function buildPagamentoTag(record) {
    const val = record.pagamento || 'Não pago';
    const cls = val === 'Pago' ? 'finalizado' : 'nao-pago';
    return `<button class="status-tag ${cls}" data-id="${record._id}" data-pagamento="${val}">${val}</button>`;
}

/* === CONTADOR DINÂMICO === */
async function updateFilaCounter() {
    try {
        const { count } = await getEmAndamentoCount();
        const el = document.querySelector('.textf p');
        if (el) {
            const num = count < 10 ? `0${count}` : `${count}`;
            el.innerHTML = `Temos <span>${num} ${count === 1 ? 'carro' : 'carros'}</span> na fila`;
        }
    } catch { /* silently fail */ }
}

/* === MODAL DE DETALHE === */
const modal2     = document.getElementById('homeModal2Overlay');
const modal2Title= document.getElementById('homeModal2Title');
const modal2Date = document.getElementById('homeModal2Date');
const btnClose2  = document.getElementById('btnCloseHomeModal2');
const detStatus  = document.getElementById('homeDetailStatus');
const detDesc    = document.getElementById('homeDetailDescricao');
const detValor   = document.getElementById('homeDetailValor');
const detPag     = document.getElementById('homeDetailPagamento');
const detPrazo   = document.getElementById('homeDetailPrazo');
const detFotos   = document.getElementById('homeDetailFotos');

let currentRecord = null;

function openModal(record) {
    currentRecord = record;
    modal2Title.textContent = record.titulo;
    modal2Date.textContent  = `${new Date(record.createdAt).toLocaleDateString('pt-BR')} · Placa: ${record.placa || '—'}`;
    detDesc.textContent     = record.descricao || 'Sem descrição.';
    detValor.textContent    = record.valor;
    detPag.textContent      = record.formaPagamento;
    detPrazo.textContent    = record.prazoEntrega;

    detStatus.innerHTML = buildStatusTag(record) + ' ' + buildPagamentoTag(record);

    detStatus.querySelector('[data-status]').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const newStatus = btn.dataset.status === 'Em andamento' ? 'Finalizado' : 'Em andamento';
        const updated = await updateRecordStatus(btn.dataset.id, newStatus);
        openModal({ ...currentRecord, ...updated });
        renderSolicitacoes();
        updateFilaCounter();
    });

    detStatus.querySelector('[data-pagamento]').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const newPag = btn.dataset.pagamento === 'Pago' ? 'Não pago' : 'Pago';
        const updated = await updateRecordPagamento(btn.dataset.id, newPag);
        openModal({ ...currentRecord, ...updated });
        renderSolicitacoes();
    });

    if (record.fotos?.length) {
        detFotos.innerHTML = record.fotos.map(src => `<img src="${src}" alt="Foto" style="cursor:zoom-in;">`).join('');
        detFotos.querySelectorAll('img').forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
    } else {
        detFotos.innerHTML = '<p class="no-photos">Nenhuma foto.</p>';
    }

    modal2.classList.add('active');
}

function closeModal() { modal2.classList.remove('active'); }
btnClose2.addEventListener('click', closeModal);
modal2.addEventListener('click', (e) => { if (e.target === modal2) closeModal(); });

/* === LIGHTBOX === */
const lbOverlay = document.getElementById('homeLightboxOverlay');
const lbImg     = document.getElementById('homeLightboxImg');
const lbClose   = document.getElementById('homeLightboxClose');

function openLightbox(src) { lbImg.src = src; lbOverlay.classList.add('active'); }
function closeLightbox()   { lbOverlay.classList.remove('active'); lbImg.src = ''; }

lbClose.addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', (e) => { if (e.target === lbOverlay) closeLightbox(); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lbOverlay.classList.contains('active'))  closeLightbox();
        else if (modal2.classList.contains('active')) closeModal();
    }
});

/* === SEÇÃO DE SOLICITAÇÕES === */
async function renderSolicitacoes() {
    const container = document.getElementById('solicitacoes-list');
    if (!container) return;

    try {
        const records = await getAllRecords();

        if (!records.length) {
            container.innerHTML = '<p class="solicitacoes-empty">Nenhuma solicitação registrada ainda.</p>';
            return;
        }

        const items = await Promise.all(records.map(async (record) => {
            const client = await getClientByCpf(record.clientCpf);
            const nome   = client ? client.nome : record.clientCpf;
            const prazo  = record.prazoEntrega || '—';
            const placa  = record.placa || '—';

            return { html: `
                <div class="solicitacao-item" data-id="${record._id}">
                    <div class="solicitacao-left">
                        <span class="solicitacao-nome">${nome}</span>
                        <span class="solicitacao-titulo">${record.titulo}</span>
                        <span class="solicitacao-titulo" style="color:#7AD95F;font-weight:600;">🚗 ${placa}</span>
                    </div>
                    <div class="solicitacao-right">
                        ${buildStatusTag(record)}
                        ${buildPagamentoTag(record)}
                        <div class="solicitacao-prazo">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#7AD95F"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11z"/></svg>
                            <span>${prazo}</span>
                        </div>
                    </div>
                </div>
            `, record };
        }));

        container.innerHTML = items.map(i => i.html).join('');

        // Clique no card → abre modal
        container.querySelectorAll('.solicitacao-item').forEach((el, idx) => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.status-tag')) return;
                openModal(items[idx].record);
            });
        });

        // Tags de status
        container.querySelectorAll('[data-status]').forEach(tag => {
            tag.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newStatus = tag.dataset.status === 'Em andamento' ? 'Finalizado' : 'Em andamento';
                await updateRecordStatus(tag.dataset.id, newStatus);
                renderSolicitacoes();
                updateFilaCounter();
            });
        });

        // Tags de pagamento
        container.querySelectorAll('[data-pagamento]').forEach(tag => {
            tag.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newPag = tag.dataset.pagamento === 'Pago' ? 'Não pago' : 'Pago';
                await updateRecordPagamento(tag.dataset.id, newPag);
                renderSolicitacoes();
            });
        });

    } catch {
        container.innerHTML = '<p class="solicitacoes-empty">Erro ao carregar solicitações.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateFilaCounter();
    renderSolicitacoes();
});
