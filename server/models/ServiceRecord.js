const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
    clientCpf:      { type: String, required: true, trim: true },
    placa:          { type: String, required: true, trim: true },
    titulo:         { type: String, required: true, trim: true },
    descricao:      { type: String, default: '', trim: true },
    valor:          { type: String, required: true },
    formaPagamento: { type: String, required: true },
    prazoEntrega:   { type: String, required: true },
    status:         { type: String, enum: ['Em andamento', 'Finalizado'], default: 'Em andamento' },
    pagamento:      { type: String, default: 'N\u00e3o pago' },
    fotos:          { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ServiceRecord', serviceRecordSchema);
