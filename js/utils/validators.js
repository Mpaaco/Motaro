export const isValidCpf = (cpf) => cpf.replace(/\D/g, '').length === 11;

export const isValidPhone = (phone) => phone.replace(/\D/g, '').length >= 10;

export const isValidYear = (year) => {
    const y = parseInt(year);
    return y >= 1920 && y <= new Date().getFullYear() + 1;
};
