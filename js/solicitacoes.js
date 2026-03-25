import { maskCpf } from './utils/masks.js';
import { getAllClients, getServiceRecords, deleteRecord, updateRecordStatus, updateRecordPagamento } from './utils/api.js';

const BASE = '/api';
let allClients = [];
let currentClientCpf = null;

const clientsGrid    = document.getElementById('clientsGrid');
const searchInput    = document.getElementById('searchCpf');
const modal1Overlay  = document.getElementById('modal1Overlay');
const modal1Title    = document.getElementById('modal1Title');
const modal1Subtitle = document.getElementById('modal1Subtitle');
const recordsList    = document.getElementById('recordsList');
const btnCloseModal1 = document.getElementById('btnCloseModal1');
const modal2Overlay  = document.getElementById('modal2Overlay');
const modal2Title    = document.getElementById('modal2Title');
const modal2Date     = document.getElementById('modal2Date');
const btnCloseModal2 = document.getElementById('btnCloseModal2');

function buildStatusTag(record) {
    const cls = record.status === 'Finalizado' ? 'finalizado' : 'em-andamento';
    return `<button class="status-tag ${cls}" data-id="${record._id}" data-status="${record.status}">${record.status}</button>`;
}

function buildPagamentoTag(record) {
    const val = record.pagamento || 'Não pago';
    const cls = val === 'Pago' ? 'finalizado' : 'nao-pago';
    return `<button class="status-tag ${cls}" data-id="${record._id}" data-pagamento="${val}">${val}</button>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        allClients = await getAllClients();
        renderClients(allClients);
    } catch {
        clientsGrid.innerHTML = '<p class="empty-state">Erro ao carregar clientes.</p>';
    }
});

searchInput.addEventListener('input', function () {
    this.value = maskCpf(this.value);
    const query = this.value.replace(/\D/g, '');
    const filtered = query ? allClients.filter(c => c.cpf.replace(/\D/g, '').startsWith(query)) : allClients;
    renderClients(filtered);
});

function renderClients(clients) {
    if (!clients.length) {
        clientsGrid.innerHTML = '<p class="empty-state">Nenhum cliente encontrado.</p>';
        return;
    }
    clientsGrid.innerHTML = clients.map(client => {
        const veiculo = client.veiculos?.[0];
        const veiculoStr = veiculo ? `${veiculo.marca} · ${veiculo.modelo} · ${veiculo.ano}` : 'Sem veículo';
        const qtd = client.veiculos?.length || 0;
        return `
        <div class="client-folder" data-cpf="${client.cpf}">
            <div class="folder-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#7AD95F"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM5 17.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm14 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
            </div>
            <div class="folder-info">
                <p class="folder-nome">${client.nome}</p>
                <p class="folder-cpf">CPF: ${client.cpf}</p>
                <p class="folder-veiculo">${veiculoStr}${qtd > 1 ? ` (+${qtd-1})` : ''}</p>
            </div>
            <span class="folder-badge">Ver</span>
        </div>`;
    }).join('');
    clientsGrid.querySelectorAll('.client-folder').forEach(card => {
        card.addEventListener('click', () => openModal1(card.dataset.cpf));
    });
}

async function openModal1(cpf) {
    currentClientCpf = cpf;
    const client = allClients.find(c => c.cpf === cpf);
    const veiculo = client?.veiculos?.[0];
    modal1Title.textContent    = client ? client.nome : cpf;
    modal1Subtitle.textContent = veiculo ? `${veiculo.marca} · ${veiculo.modelo}` : '';
    recordsList.innerHTML      = '<p class="records-empty">Carregando...</p>';
    modal1Overlay.classList.add('active');
    await loadRecords(cpf);
}

function closeModal1() { modal1Overlay.classList.remove('active'); }
btnCloseModal1.addEventListener('click', closeModal1);
modal1Overlay.addEventListener('click', (e) => { if (e.target === modal1Overlay) closeModal1(); });

async function loadRecords(cpf) {
    try {
        const records = await getServiceRecords(cpf);
        if (!records.length) { recordsList.innerHTML = '<p class="records-empty">Nenhuma solicitação.</p>'; return; }

        recordsList.innerHTML = records.map(r => `
            <div class="record-row" data-id="${r._id}">
                <div class="record-row-info">
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">${buildStatusTag(r)} ${buildPagamentoTag(r)}</div>
                    <p class="record-row-titulo">${r.titulo}</p>
                    <p class="record-row-prazo">📅 ${r.prazoEntrega} · 🚗 ${r.placa || '—'}</p>
                </div>
                <button class="btn-delete" data-id="${r._id}" title="Excluir">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
        `).join('');

        recordsList.querySelectorAll('[data-status]').forEach(tag => {
            tag.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newStatus = tag.dataset.status === 'Em andamento' ? 'Finalizado' : 'Em andamento';
                await updateRecordStatus(tag.dataset.id, newStatus);
                await loadRecords(cpf);
            });
        });

        recordsList.querySelectorAll('[data-pagamento]').forEach(tag => {
            tag.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newPag = tag.dataset.pagamento === 'Pago' ? 'Não pago' : 'Pago';
                await updateRecordPagamento(tag.dataset.id, newPag);
                await loadRecords(cpf);
            });
        });

        recordsList.querySelectorAll('.record-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete') || e.target.closest('.status-tag')) return;
                const record = records.find(r => r._id === row.dataset.id);
                openModal2(record);
            });
        });

        recordsList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Excluir esta solicitação?')) return;
                await deleteRecord(btn.dataset.id);
                await loadRecords(cpf);
            });
        });
    } catch {
        recordsList.innerHTML = '<p class="records-empty">Erro ao carregar.</p>';
    }
}

function openModal2(record) {
    modal2Title.textContent = record.titulo;
    modal2Date.textContent  = `${new Date(record.createdAt).toLocaleDateString('pt-BR')} · Placa: ${record.placa || '—'}`;
    document.getElementById('detail-descricao').textContent = record.descricao || 'Sem descrição.';
    document.getElementById('detail-valor').textContent     = record.valor;
    document.getElementById('detail-pagamento').textContent = record.formaPagamento;
    document.querySelector('#detail-prazo span').textContent = record.prazoEntrega;

    const statusEl = document.getElementById('detail-status');
    if (statusEl) {
        statusEl.innerHTML = buildStatusTag(record) + ' ' + buildPagamentoTag(record);
        statusEl.querySelector('[data-status]').addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const newStatus = btn.dataset.status === 'Em andamento' ? 'Finalizado' : 'Em andamento';
            await updateRecordStatus(btn.dataset.id, newStatus);
            record.status = newStatus;
            openModal2(record);
            await loadRecords(currentClientCpf);
        });
        statusEl.querySelector('[data-pagamento]').addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const newPag = btn.dataset.pagamento === 'Pago' ? 'Não pago' : 'Pago';
            await updateRecordPagamento(btn.dataset.id, newPag);
            record.pagamento = newPag;
            openModal2(record);
            await loadRecords(currentClientCpf);
        });
    }

    const fotosEl = document.getElementById('detail-fotos');
    if (record.fotos?.length) {
        fotosEl.innerHTML = record.fotos.map(src => `<img src="${src}" alt="Foto" style="cursor:zoom-in;">`).join('');
        fotosEl.querySelectorAll('img').forEach(img => {
            img.addEventListener('click', () => openLightbox(img.src));
        });
    } else {
        fotosEl.innerHTML = '<p class="no-photos">Nenhuma foto anexada.</p>';
    }

    modal2Overlay.classList.add('active');
}

function closeModal2() { modal2Overlay.classList.remove('active'); }
btnCloseModal2.addEventListener('click', closeModal2);
modal2Overlay.addEventListener('click', (e) => { if (e.target === modal2Overlay) closeModal2(); });

// ESC para fechar modais
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (lightboxOverlay.classList.contains('active')) { closeLightbox(); }
        else if (modal2Overlay.classList.contains('active')) { closeModal2(); }
        else if (modal1Overlay.classList.contains('active')) { closeModal1(); }
    }
});

/* ========= LIGHTBOX ========= */
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');

function openLightbox(src) {
    lightboxImg.src = src;
    lightboxOverlay.classList.add('active');
}

function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
});
