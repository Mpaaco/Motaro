export const maskCpf = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
};

export const maskPhone = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    if (v.length > 9) v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
};

export const maskCurrency = (value) => {
    let v = value.replace(/\D/g, '');
    if (!v) return '';
    v = (parseInt(v) / 100).toFixed(2);
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return `R$ ${v}`;
};

export const maskDate = (value) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length >= 5) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    else if (v.length >= 3) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    return v;
};
