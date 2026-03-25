const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    marca:  { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    ano:    { type: Number, required: true },
    placa:  { type: String, required: true, trim: true },
}, { _id: true });

const clientSchema = new mongoose.Schema({
    nome:     { type: String, required: true, trim: true },
    cpf:      { type: String, required: true, unique: true, trim: true },
    contato:  { type: String, required: true, trim: true },
    veiculos: { type: [veiculoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
