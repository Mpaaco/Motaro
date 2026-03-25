const express = require('express');
const router = express.Router();
const ServiceRecord = require('../models/ServiceRecord');

// DELETE registro por id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await ServiceRecord.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Registro não encontrado.' });
        res.json({ message: 'Registro excluído com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH atualizar status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Em andamento', 'Finalizado'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido.' });
        }
        const record = await ServiceRecord.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );
        if (!record) return res.status(404).json({ error: 'Registro não encontrado.' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH atualizar pagamento
router.patch('/:id/pagamento', async (req, res) => {
    try {
        const { pagamento } = req.body;
        const allowed = ['Pago', 'N\u00e3o pago'];
        if (!allowed.includes(pagamento)) {
            return res.status(400).json({ error: 'Pagamento inv\u00e1lido.' });
        }
        const record = await ServiceRecord.findByIdAndUpdate(
            req.params.id,
            { $set: { pagamento } },
            { returnDocument: 'after', runValidators: false }
        );
        if (!record) return res.status(404).json({ error: 'Registro n\u00e3o encontrado.' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET contagem de registros "Em andamento"
router.get('/count/em-andamento', async (req, res) => {
    try {
        const count = await ServiceRecord.countDocuments({ status: 'Em andamento' });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET todos os registros
router.get('/', async (req, res) => {
    try {
        const records = await ServiceRecord.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET registros por CPF
router.get('/:cpf', async (req, res) => {
    try {
        const records = await ServiceRecord.find({ clientCpf: req.params.cpf }).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST novo registro
router.post('/', async (req, res) => {
    try {
        const record = new ServiceRecord(req.body);
        await record.save();
        res.status(201).json({ message: 'Registro salvo com sucesso.', record });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
