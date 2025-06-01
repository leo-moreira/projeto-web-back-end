const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'bancoDeFotos';

let db;

async function connectDB() {
    if (db) return db;
    try {
        const client = new MongoClient(uri);    
        await client.connect();
        console.log('MongoDB conectado com sucesso usando o driver nativo!');
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('Erro ao conectar com o MongoDB:', error);
        throw error;
    }
}

function getCollection(collectionName) {
    if (!db) {
        throw new Error('A conexão com o banco de dados não foi estabelecida.');
    }
    return db.collection(collectionName);
}

module.exports = {
    connectDB,
    getCollection,
    ObjectId
};