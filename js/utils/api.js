const BASE_URL = '/api';

export async function saveClient(data) {
    const res = await fetch(`${BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function findClientByCpf(cpf) {
    const res = await fetch(`${BASE_URL}/clients/${encodeURIComponent(cpf)}`);
    if (res.status === 404) return null;
    return res.json();
}

export async function getAllClients() {
    const res = await fetch(`${BASE_URL}/clients`);
    return res.json();
}

export async function addVehicle(cpf, veiculo) {
    const res = await fetch(`${BASE_URL}/clients/${encodeURIComponent(cpf)}/veiculo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veiculo),
    });
    return res.json();
}

export async function saveServiceRecord(data) {
    const res = await fetch(`${BASE_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getServiceRecords(cpf) {
    const res = await fetch(`${BASE_URL}/records/${encodeURIComponent(cpf)}`);
    return res.json();
}

export async function getAllRecords() {
    const res = await fetch(`${BASE_URL}/records`);
    return res.json();
}

export async function deleteRecord(id) {
    const res = await fetch(`${BASE_URL}/records/${id}`, { method: 'DELETE' });
    return res.json();
}

export async function updateRecordStatus(id, status) {
    const res = await fetch(`${BASE_URL}/records/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    return res.json();
}

export async function updateRecordPagamento(id, pagamento) {
    const res = await fetch(`${BASE_URL}/records/${id}/pagamento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagamento }),
    });
    return res.json();
}

export async function getEmAndamentoCount() {
    const res = await fetch(`${BASE_URL}/records/count/em-andamento`);
    return res.json();
}
