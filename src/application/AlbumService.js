
const Album = require('../dominio/albuns/Album');
const AlbumRepositorio = require('../infraestrutura/persistencia/AlbumRepositorio');
const Logger = require('../infraestrutura/logs/Logger');
const { ObjectId } = require('mongodb');

class AlbumService {
    constructor() {
        this.albumRepositorio = new AlbumRepositorio(); // Idealmente injetado
        // this.photoRepository = new MongoPhotoRepository(); // Se precisar interagir com fotos ao deletar álbum
    }

    async criarAlbum(albumData, userId) {
        try {
            if (!userId || !albumData.nome) {
                Logger.warn('Tentativa de criar álbum com dados incompletos.', { albumData, userId });
                throw new Error('Nome do álbum e ID do usuário são obrigatórios.');
            }
            if (!ObjectId.isValid(userId)) {
                Logger.warn(`ID de usuário inválido ao tentar criar álbum: ${userId}`);
                throw new Error('ID de usuário inválido.');
            }

            const album = new Album(albumData.nome, albumData.descricao, albumData.urlFotoCapa, userId);

            const createdAlbum = await this.albumRepositorio.criar(album);
            Logger.info(`Álbum criado com sucesso pelo serviço: ${createdAlbum._id} para o usuário ${userId}`);
            return createdAlbum;

        } catch (error) {
            Logger.error(`Erro no serviço ao criar álbum para o usuário ${userId}: ${error.message}`, { originalError: error, albumData });
            throw error;
        }
    }

    async procurarAlbumPorId(albumId, userId) {
        try {
            if (!ObjectId.isValid(albumId) || (userId && !ObjectId.isValid(userId))) {
                Logger.warn(`ID de álbum ou usuário inválido na busca: AlbumID ${albumId}, UserID ${userId}`);
                throw new Error('ID de álbum ou usuário inválido.');
            }

            const album = await this.albumRepositorio.procurarPorId(albumId);
            if (!album) {
                Logger.info(`Álbum não encontrado no serviço com ID: ${albumId}`);
                return null;
            }

            // Opcional: Verificar se o usuário tem permissão para ver este álbum
            // (se os álbuns não forem públicos por padrão e userId for fornecido)
            if (userId && album.userId.toString() !== userId.toString()) {
                Logger.warn(`Usuário ${userId} tentou acessar álbum ${albumId} sem permissão.`);
                // Poderia retornar null ou lançar um erro de "Acesso Negado"
                // Para este exemplo, vamos assumir que se o userId for fornecido, é para validação.
                // Se o objetivo é apenas buscar por ID sem checar dono, o userId não seria passado aqui.
                return null; // Ou throw new Error('Acesso negado ao álbum.');
            }

            Logger.info(`Álbum ID: ${albumId} recuperado no serviço.`);
            return album;
        } catch (error) {
            Logger.error(`Erro no serviço ao buscar álbum por ID (${albumId}): ${error.message}`, error);
            throw error;
        }
    }

    async procurarAlbumPorIdUsuario(userId) {
        try {
            if (!ObjectId.isValid(userId)) {
                Logger.warn(`ID de usuário inválido ao buscar álbuns: ${userId}`);
                throw new Error('ID de usuário inválido.');
            }
            const albums = await this.albumRepositorio.procurarPorIdDeUsuario(userId);
            Logger.info(`Recuperados ${albums.length} álbuns para o usuário ${userId} no serviço.`);
            return albums;
        } catch (error) {
            Logger.error(`Erro no serviço ao buscar álbuns do usuário ${userId}: ${error.message}`, error);
            throw error;
        }
    }

    async atualizarAlbum(albumId, userId, updateData) {
        try {
            if (!ObjectId.isValid(albumId) || !ObjectId.isValid(userId)) {
                Logger.warn(`ID de álbum ou usuário inválido na atualização: AlbumID ${albumId}, UserID ${userId}`);
                throw new Error('ID de álbum ou usuário inválido.');
            }
            // Verificação de campos obrigatórios para atualização (se name for atualizado, não pode ser vazio)
            if (updateData.hasOwnProperty('name') && !updateData.nome) {
                 Logger.warn('Tentativa de atualizar álbum com nome vazio.', { albumId, userId });
                 throw new Error('O nome do álbum não pode ser vazio.');
            }

            const updatedAlbum = await this.albumRepositorio.atualizar(albumId, userId, updateData);
            if (!updatedAlbum) {
                Logger.info(`Álbum não encontrado ou não autorizado para atualização no serviço: AlbumID ${albumId}, UserID ${userId}`);
                // Pode ser que não pertença ao usuário ou não exista
                return null;
            }
            Logger.info(`Álbum ID: ${albumId} atualizado no serviço pelo usuário ${userId}.`);
            return updatedAlbum;
        } catch (error) {
            Logger.error(`Erro no serviço ao atualizar álbum ${albumId} para usuário ${userId}: ${error.message}`, { originalError: error, updateData });
            throw error;
        }
    }

    async deletarAlbum(albumId, userId) {
        try {
            if (!ObjectId.isValid(albumId) || !ObjectId.isValid(userId)) {
                Logger.warn(`ID de álbum ou usuário inválido na deleção: AlbumID ${albumId}, UserID ${userId}`);
                throw new Error('ID de álbum ou usuário inválido.');
            }

            // Lógica de negócio: O que fazer com as fotos do álbum?
            // Exemplo: Se as fotos devem ser deletadas junto com o álbum:
            // const photosInAlbum = await this.photoRepository.findByAlbumId(albumId);
            // for (const photo of photosInAlbum) {
            //     await this.photoAppService.deletePhoto(photo._id, userId); // Supondo um photoAppService
            // }
            // Ou apenas remover a referência do álbum nas fotos, tornando-as "órfãs" ou movendo para um álbum padrão.
            // Para este exemplo, vamos focar apenas na deleção do álbum.

            const success = await this.albumRepositorio.deletar(albumId, userId);
            if (success) {
                Logger.info(`Álbum ID: ${albumId} deletado no serviço pelo usuário ${userId}.`);
            } else {
                Logger.info(`Álbum não encontrado ou não autorizado para deleção no serviço: AlbumID ${albumId}, UserID ${userId}.`);
            }
            return success;
        } catch (error) {
            Logger.error(`Erro no serviço ao deletar álbum ${albumId} para usuário ${userId}: ${error.message}`, error);
            throw error;
        }
    }
}

module.exports = AlbumService;