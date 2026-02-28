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

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
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
        });

        // Reseta o input para permitir selecionar a mesma imagem se for apagada
        fileInput.value = '';
    });

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
