import { getAllRecords, getAllClients, findClientByCpf } from './utils/api.js';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

let allRecords  = [];
let allClients  = [];
let chart       = null;
let chartType   = 'bar';

const parseValor = (v = '') => parseFloat(v.replace(/[^\d,]/g,'').replace(',','.')) || 0;

const fmt = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

document.addEventListener('DOMContentLoaded', async () => {
    try {
        [allRecords, allClients] = await Promise.all([getAllRecords(), getAllClients()]);
        populateYears();
        render();
    } catch { console.error('Erro ao carregar dados'); }
});

function populateYears() {
    const years = [...new Set(allRecords.map(r => new Date(r.createdAt).getFullYear()))].sort((a,b)=>b-a);
    if (!years.length) years.push(new Date().getFullYear());
    const sel = document.getElementById('filterAno');
    sel.innerHTML = `<option value="">Todos os anos</option>` + years.map(y => `<option value="${y}">${y}</option>`).join('');
    sel.value = new Date().getFullYear();
}

['filterAno','filterMes','filterPagamento'].forEach(id => {
    document.getElementById(id).addEventListener('change', render);
});

document.getElementById('btnBar').addEventListener('click', () => { chartType = 'bar'; toggleChartBtn(); render(); });
document.getElementById('btnLine').addEventListener('click', () => { chartType = 'line'; toggleChartBtn(); render(); });

function toggleChartBtn() {
    document.getElementById('btnBar').classList.toggle('active', chartType === 'bar');
    document.getElementById('btnLine').classList.toggle('active', chartType === 'line');
}

function getFiltered() {
    const ano  = document.getElementById('filterAno').value;
    const mes  = document.getElementById('filterMes').value;
    const pag  = document.getElementById('filterPagamento').value;
    return allRecords.filter(r => {
        const d = new Date(r.createdAt);
        if (ano && d.getFullYear() !== parseInt(ano)) return false;
        if (mes !== '' && d.getMonth() !== parseInt(mes))  return false;
        if (pag && r.pagamento !== pag)                     return false;
        return true;
    });
}

function render() {
    const filtered   = getFiltered();
    const now        = new Date();
    const pagos      = allRecords.filter(r => r.pagamento === 'Pago');
    const nãoPagos   = allRecords.filter(r => r.pagamento !== 'Pago');
    const mesPagos   = pagos.filter(r => { const d=new Date(r.createdAt); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear(); });
    const anoPagos   = pagos.filter(r => new Date(r.createdAt).getFullYear()===now.getFullYear());

    document.getElementById('totalGeral').textContent   = fmt(pagos.reduce((s,r) => s+parseValor(r.valor),0));
    document.getElementById('totalMes').textContent     = fmt(mesPagos.reduce((s,r) => s+parseValor(r.valor),0));
    document.getElementById('totalAno').textContent     = fmt(anoPagos.reduce((s,r) => s+parseValor(r.valor),0));
    document.getElementById('totalPendente').textContent= fmt(nãoPagos.reduce((s,r) => s+parseValor(r.valor),0));

    renderChart(filtered);
    renderTable(filtered);
}

function renderChart(records) {
    const ano = document.getElementById('filterAno').value || new Date().getFullYear();
    const byMonth = Array(12).fill(0);
    records.filter(r => r.pagamento === 'Pago').forEach(r => {
        const m = new Date(r.createdAt).getMonth();
        byMonth[m] += parseValor(r.valor);
    });

    const ctx = document.getElementById('finChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: MONTHS,
            datasets: [{
                label: `Recebido ${ano}`,
                data: byMonth,
                backgroundColor: 'rgba(122, 217, 95, 0.3)',
                borderColor: '#7AD95F',
                borderWidth: 2,
                borderRadius: chartType === 'bar' ? 8 : 0,
                tension: 0.4,
                fill: chartType === 'line',
                pointBackgroundColor: '#7AD95F',
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { callback: v => 'R$ ' + v.toLocaleString('pt-BR') }, grid: { color: '#F0F0F0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

async function renderTable(records) {
    const tbody = document.getElementById('finTableBody');
    if (!records.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="fin-empty">Nenhum registro encontrado.</td></tr>';
        return;
    }
    const rows = await Promise.all(records.map(async r => {
        const client = allClients.find(c => c.cpf === r.clientCpf);
        const nome = client ? client.nome : r.clientCpf;
        const statusCls = r.status === 'Finalizado' ? 'finalizado' : 'em-andamento';
        const pagCls    = r.pagamento === 'Pago'    ? 'finalizado' : 'nao-pago';
        return `<tr>
            <td>${nome}</td>
            <td>${r.titulo}</td>
            <td>${r.placa || '—'}</td>
            <td><strong>${r.valor}</strong></td>
            <td>${r.prazoEntrega}</td>
            <td><span class="status-tag ${statusCls}">${r.status}</span></td>
            <td><span class="status-tag ${pagCls}">${r.pagamento || 'Não pago'}</span></td>
        </tr>`;
    }));
    tbody.innerHTML = rows.join('');
}

/* === EXPORT CSV === */
document.getElementById('btnExportCsv').addEventListener('click', () => {
    const filtered = getFiltered();
    const header   = ['Cliente','Titulo','Placa','Valor','Prazo','Status','Pagamento'];
    const rows     = filtered.map(r => {
        const client = allClients.find(c => c.cpf === r.clientCpf);
        return [client?.nome || r.clientCpf, r.titulo, r.placa||'', r.valor, r.prazoEntrega, r.status, r.pagamento||'Não pago'];
    });
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'motaro_financeiro.csv' });
    a.click(); URL.revokeObjectURL(url);
});

/* === EXPORT XLSX === */
document.getElementById('btnExportXlsx').addEventListener('click', () => {
    const filtered = getFiltered();
    const data = filtered.map(r => {
        const client = allClients.find(c => c.cpf === r.clientCpf);
        return {
            Cliente:    client?.nome || r.clientCpf,
            Título:     r.titulo,
            Placa:      r.placa || '',
            Valor:      r.valor,
            Prazo:      r.prazoEntrega,
            Status:     r.status,
            Pagamento:  r.pagamento || 'Não pago',
        };
    });
    const ws  = XLSX.utils.json_to_sheet(data);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financeiro');
    XLSX.writeFile(wb, 'motaro_financeiro.xlsx');
});
