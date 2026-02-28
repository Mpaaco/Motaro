// JS file to handle form validation for the MotaroApp registration.
document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.querySelector(".cadastro-form");
    const inputs = {
        nome: document.getElementById("nome"),
        cpf: document.getElementById("cpf"),
        contato: document.getElementById("contato"),
        modelo: document.getElementById("modelo"),
        ano: document.getElementById("ano")
    };

    // 1. Validation for "Nome do cliente" (Only letters and spaces)
    inputs.nome.addEventListener("input", function() {
        this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    });

    // 2. Formatting & Validation for CPF (000.000.000-00)
    inputs.cpf.addEventListener("input", function() {
        let val = this.value.replace(/\D/g, "");
        if (val.length > 11) val = val.substring(0, 11);
        
        val = val.replace(/(\d{3})(\d)/, "$1.$2");
        val = val.replace(/(\d{3})(\d)/, "$1.$2");
        val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        this.value = val;
    });

    // 3. Formatting & Validation for Cellphone Number ((00) 00000-0000)
    inputs.contato.addEventListener("input", function() {
        let val = this.value.replace(/\D/g, "");
        if (val.length > 11) val = val.substring(0, 11);
        
        if (val.length > 2) val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
        if (val.length > 7) val = val.replace(/(\d{5})(\d)/, "$1-$2");
        
        this.value = val;
    });

    // 4. Validation for "Modelo do carro" (Only text and numbers allowed, but mainly text preference via HTML type)
    // Assuming mostly text with potential numbers like "Gol 1.0" or "X6" - standard text input handles this without strict regex blocking.

    // 5. Validation for "Ano do carro" (4 digits, valid ranges like 1900-2099)
    inputs.ano.addEventListener("input", function() {
        this.value = this.value.replace(/\D/g, ""); // Only numbers
        if (this.value.length > 4) this.value = this.value.slice(0, 4);
    });

    // Handle Form Submission (Registrar Solicitação)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Simple built-in validation triggers based on 'required' in HTML.
        // If execution reaches here, all 'required' fields are superficially filled.

        if (inputs.cpf.value.length < 14) {
            alert("Por favor, preencha o CPF corretamente.");
            inputs.cpf.focus();
            return;
        }

        if (inputs.contato.value.length < 14) {
            alert("Por favor, preencha o número de contato completo.");
            inputs.contato.focus();
            return;
        }

        if (inputs.ano.value.length < 4 || inputs.ano.value < 1920 || inputs.ano.value > new Date().getFullYear() + 1) {
            alert("Por favor, insira um ano válido para o carro.");
            inputs.ano.focus();
            return;
        }

        // Simulating success
        alert("Cadastro realizado com sucesso!");
        form.reset();
        
        // Return to home or reset form flow
        // window.location.href = "index.html";
    });
});
