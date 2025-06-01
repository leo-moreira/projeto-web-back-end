const { getCollection, ObjectId } = require("./db");
const Logger = require('../logs/Logger');

const COLLECTION_FOTOS = 'fotos';

class FotoRepositorio {
    async criar(foto) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            const resultado = await colecaoFotos.insertOne(foto);
            Logger.info(`Foto criada com ID: ${resultado.insertedId} para o usuário ${foto.usuarioId}`);
            return { _id: resultado.insertedId, ...foto };
        } catch (erro) {
            Logger.error(`Erro ao criar foto no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar criar foto.');
        }
    }

    async procurarPorId(fotoId) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!ObjectId.isValid(fotoId)) {
                Logger.warn(`Tentativa de buscar foto com ID inválido: ${fotoId}`);
                return null;
            }
            const foto = await colecaoFotos.findOne({ _id: fotoId });
            if (foto) {
                Logger.info(`Foto encontrada por ID: ${fotoId}`);
            } else {
                Logger.info(`Foto não encontrada por ID: ${fotoId}`);
            }
            return foto;
        } catch (erro) {
            Logger.error(`Erro ao buscar foto por ID (${fotoId}) no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar buscar foto por ID.');
        }
    }

    async buscarPorUsuarioId(usuarioId) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!ObjectId.isValid(usuarioId)) {
                Logger.warn(`Tentativa de buscar fotos com usuarioId inválido: ${usuarioId}`);
                return [];
            }
            const fotos = await colecaoFotos.find({ usuarioId: usuarioId }).toArray();
            Logger.info(`Encontradas ${fotos.length} fotos para o usuário ID: ${usuarioId}`);
            return fotos;
        } catch (erro) {
            Logger.error(`Erro ao buscar fotos por usuarioId (${usuarioId}) no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar buscar fotos do usuário.');
        }
    }

    async buscarPorAlbumId(albumId) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!ObjectId.isValid(albumId)) {
                Logger.warn(`Tentativa de buscar fotos com albumId inválido: ${albumId}`);
                return [];
            }

            const fotos = await colecaoFotos.find({ albumIds: albumId }).toArray();
            Logger.info(`Encontradas ${fotos.length} fotos para o álbum ID: ${albumId}`);
            return fotos;
        } catch (erro) {
            Logger.error(`Erro ao buscar fotos por albumId (${albumId}) no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar buscar fotos do álbum.');
        }
    }

    async buscarPorTags(tags) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!Array.isArray(tags) || tags.length === 0) {
                Logger.warn('Tentativa de buscar fotos com tags inválidas ou vazias.', { tags });
                return [];
            }
            const fotos = await colecaoFotos.find({ tags: { $in: tags } }).toArray();
            Logger.info(`Encontradas ${fotos.length} fotos para as tags: ${tags.join(', ')}`);
            return fotos;
        } catch (erro) {
            Logger.error(`Erro ao buscar fotos por tags no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar buscar fotos por tags.');
        }
    }

    async atualizar(fotoId, usuarioId, dadosAtualizacao) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!ObjectId.isValid(fotoId) || !ObjectId.isValid(usuarioId)) {
                Logger.warn(`Tentativa de atualizar foto com ID inválido: FotoID ${fotoId}, UsuarioID ${usuarioId}`);
                return null;
            }

            const dadosParaAtualizar = { ...dadosAtualizacao };
            delete dadosParaAtualizar._id;
            delete dadosParaAtualizar.usuarioId;
            delete dadosParaAtualizar.nomeArquivo;
            delete dadosParaAtualizar.urlArmazenamento;
            delete dadosParaAtualizar.dataUpload;
            delete dadosParaAtualizar.dataCriacao;


            const resultado = await colecaoFotos.findOneAndUpdate(
                { _id: fotoId, usuarioId: usuarioId },
                { $set: { ...dadosParaAtualizar, dataAtualizacao: new Date() } },
                { returnDocument: 'after' }
            );

            if (resultado) {
                Logger.info(`Foto ID: ${fotoId} atualizada pelo usuário ID: ${usuarioId}`);
                return resultado;
            } else {
                Logger.info(`Foto ID: ${fotoId} não encontrada ou não pertence ao usuário ID: ${usuarioId} para atualização.`);
                return null;
            }
        } catch (erro) {
            Logger.error(`Erro ao atualizar foto ID (${fotoId}) no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar atualizar foto.');
        }
    }

    async deletar(fotoId, usuarioId) {
        try {
            const colecaoFotos = getCollection(COLLECTION_FOTOS);
            if (!ObjectId.isValid(fotoId) || !ObjectId.isValid(usuarioId)) {
                Logger.warn(`Tentativa de deletar foto com ID inválido: FotoID ${fotoId}, UsuarioID ${usuarioId}`);
                return false;
            }

            const resultado = await colecaoFotos.deleteOne({ _id: fotoId, usuarioId: usuarioId });

            if (resultado.deletedCount === 1) {
                Logger.info(`Foto ID: ${fotoId} deletada pelo usuário ID: ${usuarioId}`);
                return true;
            } else {
                Logger.info(`Foto ID: ${fotoId} não encontrada ou não pertence ao usuário ID: ${usuarioId} para deleção.`);
                return false;
            }
        } catch (erro) {
            Logger.error(`Erro ao deletar foto ID (${fotoId}) no repositório: ${erro.message}`, erro);
            throw new Error('Erro no servidor ao tentar deletar foto.');
        }
    }
}

module.exports = FotoRepositorio;