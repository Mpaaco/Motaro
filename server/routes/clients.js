const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// GET todos os clientes
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ nome: 1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET cliente por CPF
router.get('/:cpf', async (req, res) => {
    try {
        const client = await Client.findOne({ cpf: req.params.cpf });
        if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST cadastrar/atualizar cliente (primeiro veículo)
router.post('/', async (req, res) => {
    try {
        const { nome, cpf, contato, marca, modelo, ano, placa } = req.body;
        const veiculo = { marca, modelo, ano: parseInt(ano), placa };

        const existing = await Client.findOne({ cpf });
        if (existing) {
            existing.nome    = nome    || existing.nome;
            existing.contato = contato || existing.contato;
            if (placa && !existing.veiculos.some(v => v.placa === placa)) {
                existing.veiculos.push(veiculo);
            }
            await existing.save();
            return res.json({ message: 'Cliente atualizado com sucesso.', client: existing });
        }

        const client = new Client({ nome, cpf, contato, veiculos: [veiculo] });
        await client.save();
        res.status(201).json({ message: 'Cliente cadastrado com sucesso.', client });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST adicionar novo veículo a cliente existente
router.post('/:cpf/veiculo', async (req, res) => {
    try {
        const { marca, modelo, ano, placa } = req.body;
        const client = await Client.findOne({ cpf: req.params.cpf });
        if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });

        if (client.veiculos.some(v => v.placa === placa)) {
            return res.status(400).json({ error: 'Veículo com essa placa já cadastrado.' });
        }

        client.veiculos.push({ marca, modelo, ano: parseInt(ano), placa });
        await client.save();
        res.json({ message: 'Veículo adicionado.', client });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
