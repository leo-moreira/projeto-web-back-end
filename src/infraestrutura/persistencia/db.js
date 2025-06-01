// db.js
const { MongoClient, ObjectId } = require('mongodb');

// Sua string de conexão do MongoDB
const uri = 'mongodb://localhost:27017'; // Substitua se necessário
const dbName = 'bancoDeFotos'; // Nome do seu banco de dados

let db;

async function connectDB() {
    if (db) return db; // Retorna a instância existente se já conectado
    try {
        const client = new MongoClient(uri);    
        await client.connect();
        console.log('MongoDB conectado com sucesso usando o driver nativo!');
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('Erro ao conectar com o MongoDB:', error);
        // O tratamento de log de erros e exceções é um requisito do projeto [cite: 12]
        // Aqui você pode adicionar o log da exceção capturada [cite: 16]
        throw error;
    }
}

// Função para obter a referência a uma coleção específica
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