import { maskCpf, maskCurrency, maskDate } from './utils/masks.js';
import { findClientByCpf, saveServiceRecord, getServiceRecords, addVehicle, updateRecordStatus } from './utils/api.js';

const maskPlaca = (v) => {
    v = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3);
    return v;
};

function buildStatusTag(record) {
    const cls = record.status === 'Finalizado' ? 'finalizado' : 'em-andamento';
    return `<button class="status-tag ${cls}" data-id="${record._id}" data-status="${record.status}">${record.status}</button>`;
}

document.addEventListener('DOMContentLoaded', () => {
    /* === CPF SEARCH === */
    const cpfSearchInput  = document.getElementById('cpfSearch');
    const btnBuscar       = document.getElementById('btnBuscar');
    const clientCard      = document.getElementById('clientCard');
    const clientNome      = document.getElementById('clientNome');
    const clientVeiculo   = document.getElementById('clientVeiculo');
    const veiculoSelector = document.getElementById('veiculoSelector');
    const veiculoOptions  = document.getElementById('veiculoOptions');
    const btnNovoVeiculo  = document.getElementById('btnNovoVeiculo');
    const novoVeiculoForm = document.getElementById('novoVeiculoForm');
    const btnSalvarVeiculo= document.getElementById('btnSalvarVeiculo');
    const registroForm    = document.getElementById('registroForm');
    const placaSelecionada= document.getElementById('placaSelecionada');
    const historicoSection= document.getElementById('historicoSection');
    const historicoList   = document.getElementById('historicoList');

    let currentClient = null;
    let currentPlaca  = null;

    cpfSearchInput.addEventListener('input', function () { this.value = maskCpf(this.value); });

    btnBuscar.addEventListener('click', async () => {
        const cpf = cpfSearchInput.value.trim();
        if (!cpf) return;
        try {
            const client = await findClientByCpf(cpf);
            if (!client) {
                clientCard.style.display = 'none';
                veiculoSelector.style.display = 'none';
                registroForm.style.display = 'none';
                alert('Cliente não encontrado. Cadastre-o primeiro.');
                return;
            }
            currentClient = client;
            clientNome.textContent    = client.nome;
            clientVeiculo.textContent = `${client.veiculos?.length || 0} veículo(s) cadastrado(s)`;
            clientCard.style.display  = 'flex';
            renderVeiculoOptions(client.veiculos || []);
            veiculoSelector.style.display = 'block';
            registroForm.style.display    = 'none';
            renderHistorico(client.cpf);
        } catch {
            alert('Erro ao buscar cliente.');
        }
    });

    function renderVeiculoOptions(veiculos) {
        if (!veiculos.length) {
            veiculoOptions.innerHTML = '<p style="font-size:13px;color:#8C8C8C;margin-bottom:10px;">Nenhum veículo cadastrado ainda.</p>';
            return;
        }
        veiculoOptions.innerHTML = veiculos.map(v => `
            <button type="button" class="veiculo-option-btn" data-placa="${v.placa}">
                <strong>${v.marca} ${v.modelo} (${v.ano})</strong>
                <span class="veiculo-placa">${v.placa}</span>
            </button>
        `).join('');

        veiculoOptions.querySelectorAll('.veiculo-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                veiculoOptions.querySelectorAll('.veiculo-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentPlaca = btn.dataset.placa;
                placaSelecionada.value = currentPlaca;
                registroForm.style.display = 'flex';
                novoVeiculoForm.style.display = 'none';
            });
        });
    }

    btnNovoVeiculo.addEventListener('click', () => {
        novoVeiculoForm.style.display = novoVeiculoForm.style.display === 'none' ? 'block' : 'none';
        document.getElementById('nvPlaca').addEventListener('input', function () { this.value = maskPlaca(this.value); });
    });

    btnSalvarVeiculo.addEventListener('click', async () => {
        const marca  = document.getElementById('nvMarca').value.trim();
        const modelo = document.getElementById('nvModelo').value.trim();
        const ano    = document.getElementById('nvAno').value.trim();
        const placa  = document.getElementById('nvPlaca').value.trim();

        if (!marca || !modelo || !ano || !placa) { alert('Preencha todos os campos do veículo.'); return; }

        try {
            const result = await addVehicle(currentClient.cpf, { marca, modelo, ano: parseInt(ano), placa });
            if (result.error) { alert(result.error); return; }
            currentClient = result.client;
            currentPlaca = placa;
            placaSelecionada.value = placa;
            renderVeiculoOptions(currentClient.veiculos);
            novoVeiculoForm.style.display = 'none';
            registroForm.style.display = 'flex';
            alert('Veículo adicionado!');
        } catch {
            alert('Erro ao adicionar veículo.');
        }
    });

    /* === CONTADOR DE CARACTERES === */
    const textarea = document.getElementById('descricao');
    const charCount = document.getElementById('charCount');
    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = `${len}/300`;
        charCount.style.color = len >= 300 ? '#FF5252' : '#8C8C8C';
    });

    /* === MÁSCARAS === */
    const valorInput = document.getElementById('valorOrcamento');
    const prazoInput = document.getElementById('prazoEntrega');
    valorInput.addEventListener('input', (e) => { e.target.value = maskCurrency(e.target.value); });
    prazoInput.addEventListener('input', (e) => { e.target.value = maskDate(e.target.value); });

    /* === UPLOAD === */
    const fileInput = document.getElementById('fotoProblema');
    const previewContainer = document.getElementById('imagePreview');
    const MAX_IMAGES = 4;
    let selectedFiles = [];

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length > MAX_IMAGES) { alert(`Máximo de ${MAX_IMAGES} fotos.`); return; }
        files.forEach(f => addFileToPreview(f));
        fileInput.value = '';
    });

    /* === CÂMERA === */
    const cameraModal = document.getElementById('cameraModal');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const uploadZone = cameraModal.parentElement;
    const btnOpenCamera = document.getElementById('btnOpenCamera');
    const btnCloseCamera = document.getElementById('btnCloseCamera');
    const btnCapturePhoto = document.getElementById('btnCapturePhoto');
    const btnSwitchCamera = document.getElementById('btnSwitchCamera');
    const cameraLiveControls = document.getElementById('cameraLiveControls');
    const cameraApprovalControls = document.getElementById('cameraApprovalControls');
    const btnApprovePhoto = document.getElementById('btnApprovePhoto');
    const btnRejectPhoto = document.getElementById('btnRejectPhoto');
    let currentStream = null;
    let currentFacingMode = 'environment';

    btnOpenCamera.addEventListener('click', () => {
        if (selectedFiles.length >= MAX_IMAGES) { alert(`Máximo de ${MAX_IMAGES} fotos.`); return; }
        if (!navigator.mediaDevices?.getUserMedia) { alert('Câmera não suportada neste contexto.'); return; }
        uploadZone.classList.add('camera-open');
        cameraModal.style.display = 'block';
        startCamera();
    });

    btnCloseCamera.addEventListener('click', stopCamera);
    btnSwitchCamera.addEventListener('click', () => { currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment'; startCamera(); });

    async function startCamera() {
        if (currentStream) currentStream.getTracks().forEach(t => t.stop());
        try {
            currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
            cameraVideo.srcObject = currentStream;
        } catch { alert('Não foi possível acessar a câmera.'); stopCamera(); }
    }

    function stopCamera() {
        if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
        cameraVideo.srcObject = null;
        cameraModal.style.display = 'none';
        uploadZone.classList.remove('camera-open');
        cameraVideo.style.display = 'block'; cameraCanvas.style.display = 'none';
        cameraLiveControls.style.display = 'flex'; cameraApprovalControls.style.display = 'none';
    }

    btnCapturePhoto.addEventListener('click', () => {
        if (!currentStream) return;
        cameraCanvas.width = cameraVideo.videoWidth; cameraCanvas.height = cameraVideo.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraVideo.style.display = 'none'; cameraCanvas.style.display = 'block';
        cameraLiveControls.style.display = 'none'; cameraApprovalControls.style.display = 'flex';
    });

    btnRejectPhoto.addEventListener('click', () => {
        cameraVideo.style.display = 'block'; cameraCanvas.style.display = 'none';
        cameraLiveControls.style.display = 'flex'; cameraApprovalControls.style.display = 'none';
    });

    btnApprovePhoto.addEventListener('click', () => {
        cameraCanvas.toBlob((blob) => {
            if (!blob) { alert('Erro ao capturar.'); return; }
            addFileToPreview(new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' }));
            stopCamera();
        }, 'image/jpeg', 0.85);
    });

    function addFileToPreview(file) {
        if (selectedFiles.length >= MAX_IMAGES || !file.type.startsWith('image/')) return;
        selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const item = document.createElement('div'); item.className = 'preview-item';
            const img = document.createElement('img'); img.src = e.target.result;
            const btn = document.createElement('button'); btn.className = 'btn-remove-preview'; btn.innerHTML = 'X'; btn.type = 'button';
            btn.onclick = () => { selectedFiles.splice(selectedFiles.indexOf(file), 1); item.remove(); };
            item.append(img, btn); previewContainer.appendChild(item);
        };
        reader.readAsDataURL(file);
    }

    /* === HISTÓRICO === */
    async function renderHistorico(cpf) {
        const records = await getServiceRecords(cpf);
        historicoSection.style.display = records.length ? 'block' : 'none';
        historicoList.innerHTML = records.map(r => `
            <div class="historico-item">
                <div class="historico-header">
                    <span class="historico-date">${new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span class="historico-valor">${r.valor}</span>
                </div>
                <div style="margin: 6px 0 4px;">
                    ${buildStatusTag(r)}
                </div>
                <p class="historico-desc">${r.titulo}</p>
                <span class="historico-pagamento">${r.formaPagamento} · Prazo: ${r.prazoEntrega} · Placa: ${r.placa}</span>
            </div>
        `).join('');

        historicoList.querySelectorAll('.status-tag').forEach(tag => {
            tag.addEventListener('click', async () => {
                const newStatus = tag.dataset.status === 'Em andamento' ? 'Finalizado' : 'Em andamento';
                await updateRecordStatus(tag.dataset.id, newStatus);
                renderHistorico(cpf);
            });
        });
    }

    /* === SUBMIT === */
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = e => resolve(e.target.result); reader.onerror = reject; reader.readAsDataURL(file);
    });

    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentClient || !currentPlaca) { alert('Selecione um veículo antes de continuar.'); return; }

        const fotos = await Promise.all(selectedFiles.map(fileToBase64));
        const record = {
            clientCpf:      currentClient.cpf,
            placa:          currentPlaca,
            titulo:         document.getElementById('titulo').value.trim(),
            descricao:      textarea.value.trim(),
            valor:          valorInput.value.trim(),
            formaPagamento: document.getElementById('formaPagamento').value,
            prazoEntrega:   prazoInput.value.trim(),
            fotos,
        };

        try {
            await saveServiceRecord(record);
            alert('Solicitação registrada com sucesso!');
            window.location.href = '/';
        } catch {
            alert('Erro ao salvar o registro.');
        }
    });
});
