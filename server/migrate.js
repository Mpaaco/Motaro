/**
 * migrate.js — Executa uma vez para converter clientes antigos
 * (marca/modelo/ano soltos) para o novo formato veiculos[].
 * 
 * Uso: node server/migrate.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const db = mongoose.connection.db;
    const clients = db.collection('clients');
    const cursor = clients.find({ marca: { $exists: true } });

    let count = 0;
    for await (const doc of cursor) {
        const veiculo = {
            _id: new mongoose.Types.ObjectId(),
            marca:  doc.marca  || 'A DEFINIR',
            modelo: doc.modelo || 'A DEFINIR',
            ano:    doc.ano    || 2000,
            placa:  'A DEFINIR',
        };
        await clients.updateOne(
            { _id: doc._id },
            {
                $set:   { veiculos: [veiculo] },
                $unset: { marca: '', modelo: '', ano: '' },
            }
        );
        count++;
    }

    console.log(`✅ ${count} cliente(s) migrado(s) para o novo formato.`);
    await mongoose.disconnect();
}

migrate().catch(err => { console.error('❌ Erro na migração:', err); process.exit(1); });
