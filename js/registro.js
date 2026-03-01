/**
 * REGRISTRO.JS
 * Lógica para o formulário da página de Registro da Motaro.
 */

document.addEventListener("DOMContentLoaded", () => {
    /* =========================================
       1. CONTADOR DE CARACTERES
       ========================================= */
    const textarea = document.getElementById('descricao');
    const charCount = document.getElementById('charCount');
    const maxLength = 300;

    textarea.addEventListener('input', () => {
        const textLength = textarea.value.length;
        charCount.textContent = `${textLength}/${maxLength}`;

        if (textLength >= maxLength) {
            charCount.style.color = '#FF5252'; // Alert color
        } else {
            charCount.style.color = '#8C8C8C'; // Default color
        }
    });

    /* =========================================
       2. MÁSCARA DE MOEDA (BRL)
       ========================================= */
    const valorInput = document.getElementById('valorOrcamento');

    valorInput.addEventListener('input', (e) => {
        let value = e.target.value;
        value = value.replace(/\D/g, ""); // Remove tudo que não é dígito

        if (value.length > 0) {
            // Formata para R$ 0,00
            value = (parseInt(value) / 100).toFixed(2) + "";
            value = value.replace(".", ",");
            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            e.target.value = `R$ ${value}`;
        } else {
            e.target.value = "";
        }
    });

    /* =========================================
       3. UPLOAD DE IMAGENS (MÁX 4)
       ========================================= */
    const fileInput = document.getElementById('fotoProblema');
    const previewContainer = document.getElementById('imagePreview');
    const MAX_IMAGES = 4;
    let selectedFiles = [];

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);

        // Verifica limite
        if (selectedFiles.length + files.length > MAX_IMAGES) {
            alert(`Você pode enviar no máximo ${MAX_IMAGES} fotos.`);
            return;
        }

        files.forEach(file => addFileToPreview(file));

        // Reseta o input para permitir selecionar a mesma imagem se for apagada
        fileInput.value = '';
    });

    /* =========================================
       3.5 CAMERA IN-APP LOGIC
       ========================================= */
    const cameraModal = document.getElementById('cameraModal');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const btnOpenCamera = document.getElementById('btnOpenCamera');
    const btnCloseCamera = document.getElementById('btnCloseCamera');
    const btnCapturePhoto = document.getElementById('btnCapturePhoto');
    const btnSwitchCamera = document.getElementById('btnSwitchCamera');

    let currentStream = null;
    let currentFacingMode = 'environment'; // Default to back camera

    // Abre a câmera
    btnOpenCamera.addEventListener('click', () => {
        if (selectedFiles.length >= MAX_IMAGES) {
            alert(`Você pode enviar no máximo ${MAX_IMAGES} fotos.`);
            return;
        }
        cameraModal.classList.add('active');
        startCamera();
    });

    // Fecha a câmera
    btnCloseCamera.addEventListener('click', stopCamera);

    // Troca de câmera (Frontal/Traseira)
    btnSwitchCamera.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera();
    });

    // Função para iniciar o stream da câmera
    async function startCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        try {
            const constraints = {
                video: {
                    facingMode: currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraVideo.srcObject = currentStream;
        } catch (error) {
            console.error('Erro ao acessar a câmera:', error);
            alert('Não foi possível acessar a câmera. Verifique as permissões.');
            stopCamera();
        }
    }

    // Função para parar a câmera e fechar modal
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        cameraVideo.srcObject = null;
        cameraModal.classList.remove('active');
    }

    // Capturar foto
    btnCapturePhoto.addEventListener('click', () => {
        if (!currentStream) return;

        // Configura o canvas com as dimensões reais do vídeo
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;

        // Desenha o frame atual no canvas
        const ctx = cameraCanvas.getContext('2d');
        ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

        // Converte para Blob (File)
        cameraCanvas.toBlob((blob) => {
            if (!blob) {
                alert('Erro ao capturar a imagem.');
                return;
            }

            // Cria um arquivo fictício a partir do blob
            const fileName = `foto_camera_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            // Adiciona ao array de files
            addFileToPreview(file);

            // Fecha a câmera após foto
            stopCamera();
        }, 'image/jpeg', 0.85); // 85% de qualidade
    });

    // Função auxiliar extraída para suportar tanto Input nativo quanto Câmera In-App
    function addFileToPreview(file) {
        if (selectedFiles.length >= MAX_IMAGES || !file.type.startsWith('image/')) return;

        selectedFiles.push(file);
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Preview da foto do problema';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-preview';
            removeBtn.innerHTML = 'X';
            removeBtn.type = 'button';

            removeBtn.onclick = () => {
                const index = selectedFiles.indexOf(file);
                if (index > -1) {
                    selectedFiles.splice(index, 1);
                    previewItem.remove();
                }
            };

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewContainer.appendChild(previewItem);
        };

        reader.readAsDataURL(file);
    }

    /* =========================================
       4. MÁSCARA DE DATA (DD/MM/YYYY)
       ========================================= */
    const prazoInput = document.getElementById('prazoEntrega');

    prazoInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove não dígitos

        if (value.length > 8) {
            value = value.substring(0, 8); // Limita a 8 dígitos máximos do formato data
        }

        // Aplica a formatação DD/MM/YYYY
        if (value.length >= 5) {
            value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
        } else if (value.length >= 3) {
            value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
        }

        e.target.value = value;
    });

    /* =========================================
       5. SUBMIT DO FORMULÁRIO (MOC)
       ========================================= */
    const registroForm = document.getElementById('registroForm');
    registroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Solicitação registrada com sucesso! (Demonstração)');
        // Lógica de API iria aqui...
        registroForm.reset();
        charCount.textContent = `0/${maxLength}`;
        charCount.style.color = '#8C8C8C';
        previewContainer.innerHTML = '';
        selectedFiles = [];
    });
});
