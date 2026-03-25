require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const clientsRouter = require('./routes/clients');
const recordsRouter = require('./routes/records');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

app.use('/api/clients', clientsRouter);
app.use('/api/records', recordsRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB Atlas');
        app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        process.exit(1);
    });
