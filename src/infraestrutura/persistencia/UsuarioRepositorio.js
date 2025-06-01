const { getCollection, ObjectId } = require("./db");
const Logger = require("../logs/Logger");

const COLLECTION_NAME = "usuarios";

class UsuarioRepositorio {

    async criar(user) {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            const result = await usersCollection.insertOne(user);
            Logger.info(`Usuário criado com ID: ${result.insertedId}`);
            return { _id: result.insertedId, ...user };
        } catch (error) {
            Logger.error(`Erro ao criar usuário no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar criar usuário.');
        }
    }

    async procurarPorId(userId) {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            if (!ObjectId.isValid(userId)) {
                Logger.warn(`Tentativa de buscar usuário com ID inválido: ${userId}`);
                return null;
            }
            const user = await usersCollection.findOne({ _id: userId });
            if (user) {
                Logger.info(`Usuário encontrado por ID: ${userId}`);
            } else {
                Logger.info(`Usuário não encontrado por ID: ${userId}`);
            }
            return user;
        } catch (error) {
            Logger.error(`Erro ao buscar usuário por ID no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar buscar usuário por ID.');
        }
    }

    async procurarPorEmail(email) {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            const user = await usersCollection.findOne({ email: email });
            if (user) {
                Logger.info(`Usuário encontrado por email: ${email}`);
            } else {
                Logger.info(`Usuário não encontrado por email: ${email}`);
            }
            return user;
        } catch (error) {
            Logger.error(`Erro ao buscar usuário por email no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar buscar usuário por email.');
        }
    }

    async procurarTodos() {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            const users = await usersCollection.find({}).toArray();
            Logger.info(`Total de usuários encontrados: ${users.length}`);
            return users;
        } catch (error) {
            Logger.error(`Erro ao buscar todos os usuários no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar buscar todos os usuários.');
        }
    }

    async atualizar(userId, updateData) {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            if (!ObjectId.isValid(userId)) {
                Logger.warn(`Tentativa de atualizar usuário com ID inválido: ${userId}`);
                return null;
            }

            const dataToUpdate = { ...updateData };
            delete dataToUpdate._id;

            const result = await usersCollection.findOneAndUpdate(
                { _id: userId },
                { $set: { ...dataToUpdate, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (result) {
                Logger.info(`Usuário atualizado com ID: ${userId}`);
                return result;
            } else {
                Logger.info(`Usuário não encontrado para atualização com ID: ${userId}`);
                return null;
            }
        } catch (error) {
            Logger.error(`Erro ao atualizar usuário no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar atualizar usuário.');
        }
    }

    async deletar(userId) {
        try {
            const usersCollection = getCollection(COLLECTION_NAME);
            if (!ObjectId.isValid(userId)) {
                Logger.warn(`Tentativa de deletar usuário com ID inválido: ${userId}`);
                return false;
            }
            const result = await usersCollection.deleteOne({ _id: userId });
            if (result.deletedCount === 1) {
                Logger.info(`Usuário deletado com ID: ${userId}`);
                return true;
            } else {
                Logger.info(`Usuário não encontrado para deleção com ID: ${userId}`);
                return false;
            }
        } catch (error) {
            Logger.error(`Erro ao deletar usuário no repositório: ${error.message}`, error);
            throw new Error('Erro no servidor ao tentar deletar usuário.');
        }
    }
}

module.exports = UsuarioRepositorio;