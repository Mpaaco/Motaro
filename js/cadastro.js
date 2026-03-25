import { maskCpf, maskPhone } from './utils/masks.js';
import { isValidCpf, isValidPhone, isValidYear } from './utils/validators.js';
import { saveClient } from './utils/api.js';

const maskPlaca = (v) => {
    v = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (v.length > 7) v = v.slice(0, 7);
    if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3);
    return v;
};

document.addEventListener('DOMContentLoaded', () => {
    const form      = document.querySelector('.cadastro-form');
    const btnProximo = document.getElementById('btnProximo');
    const inputs = {
        nome:    document.getElementById('nome'),
        cpf:     document.getElementById('cpf'),
        contato: document.getElementById('contato'),
        marca:   document.getElementById('marca'),
        modelo:  document.getElementById('modelo'),
        ano:     document.getElementById('ano'),
        placa:   document.getElementById('placa'),
    };

    const requiredFields = Object.values(inputs);

    function checkFormFilled() {
        const filled = requiredFields.every(el => el.value.trim() !== '');
        btnProximo.disabled = !filled;
        btnProximo.style.opacity = filled ? '1' : '0.45';
        btnProximo.style.cursor  = filled ? 'pointer' : 'not-allowed';
    }

    requiredFields.forEach(el => el.addEventListener('input', checkFormFilled));
    checkFormFilled();

    btnProximo.addEventListener('click', () => {
        if (btnProximo.disabled) return;
        window.location.href = './registro.html';
    });

    inputs.nome.addEventListener('input',    function () { this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); });
    inputs.cpf.addEventListener('input',     function () { this.value = maskCpf(this.value); });
    inputs.contato.addEventListener('input', function () { this.value = maskPhone(this.value); });
    inputs.ano.addEventListener('input',     function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });
    inputs.placa.addEventListener('input',   function () { this.value = maskPlaca(this.value); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isValidCpf(inputs.cpf.value))     { alert('CPF inválido.');       inputs.cpf.focus();     return; }
        if (!isValidPhone(inputs.contato.value)){ alert('Contato inválido.');   inputs.contato.focus(); return; }
        if (!isValidYear(inputs.ano.value))     { alert('Ano inválido.');        inputs.ano.focus();     return; }

        try {
            const result = await saveClient({
                nome:    inputs.nome.value.trim(),
                cpf:     inputs.cpf.value.trim(),
                contato: inputs.contato.value.trim(),
                marca:   inputs.marca.value.trim(),
                modelo:  inputs.modelo.value.trim(),
                ano:     parseInt(inputs.ano.value),
                placa:   inputs.placa.value.trim(),
            });
            alert(result.message || 'Cadastro realizado com sucesso!');
            window.location.href = '/';
        } catch {
            alert('Erro ao salvar. Verifique a conexão com o servidor.');
        }
    });
});
