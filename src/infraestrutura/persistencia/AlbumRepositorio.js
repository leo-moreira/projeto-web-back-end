const { getCollection, ObjectId } = require("./db");
const Logger = require("../logs/Logger");

const COLLECTION_ALBUMS = "albums";

class AlbumRepositorio {
  async criar(album) {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      const result = await albumsCollection.insertOne(album);
      Logger.info(
        `Álbum criado com ID: ${result.insertedId} para o usuário ${album.userId}`
      );
      return { _id: result.insertedId, ...album };
    } catch (error) {
      Logger.error(
        `Erro ao criar álbum no repositório: ${error.message}`,
        error
      );
      throw new Error("Erro no servidor ao tentar criar álbum.");
    }
  }

  async procurarPorId(albumId) {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      if (!ObjectId.isValid(albumId)) {
        Logger.warn(`Tentativa de buscar álbum com ID inválido: ${albumId}`);
        return null;
      }
      const album = await albumsCollection.findOne({ _id: albumId });
      if (album) {
        Logger.info(`Álbum encontrado por ID: ${albumId}`);
      } else {
        Logger.info(`Álbum não encontrado por ID: ${albumId}`);
      }
      return album;
    } catch (error) {
      Logger.error(
        `Erro ao buscar álbum por ID no repositório: ${error.message}`,
        error
      );
      throw new Error("Erro no servidor ao tentar buscar álbum por ID.");
    }
  }

  async procurarTodos() {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      const albums = await albumsCollection.find({}).toArray();
      Logger.info(`Foram encontrados ${albums.length} álbuns no total.`);
      return albums;
    } catch (error) {
      Logger.error(`Erro ao buscar todos os álbuns: ${error.message}`, error);
      throw new Error("Erro no servidor ao tentar buscar todos os álbuns.");
    }
  }

  async atualizar(albumId, userId, albumAtualizado) {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      if (!ObjectId.isValid(albumId) || !ObjectId.isValid(userId)) {
        Logger.warn(
          `Tentativa de atualizar álbum com ID inválido: AlbumID ${albumId}, UserID ${userId}`
        );
        return null;
      }

      const dataToUpdate = { ...albumAtualizado };
      delete dataToUpdate._id;
      delete dataToUpdate.userId;

      const result = await albumsCollection.findOneAndUpdate(
        { _id: albumId, userId: userId },
        { $set: { ...dataToUpdate, updatedAt: new Date() } },
        { returnDocument: "after" }
      );

      if (result) {
        Logger.info(
          `Álbum ID: ${albumId} atualizado pelo usuário ID: ${userId}`
        );
        return result;
      } else {
        Logger.info(
          `Álbum ID: ${albumId} não encontrado ou não pertence ao usuário ID: ${userId} para atualização.`
        );
        return null;
      }
    } catch (error) {
      Logger.error(
        `Erro ao atualizar álbum ID (${albumId}) no repositório: ${error.message}`,
        error
      );
      throw new Error("Erro no servidor ao tentar atualizar álbum.");
    }
  }

  async deletar(albumId, userId) {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      if (!ObjectId.isValid(albumId) || !ObjectId.isValid(userId)) {
        Logger.warn(
          `Tentativa de deletar álbum com ID inválido: AlbumID ${albumId}, UserID ${userId}`
        );
        return false;
      }
      const result = await albumsCollection.deleteOne({
        _id: albumId,
        userId: userId,
      });

      if (result.deletedCount === 1) {
        Logger.info(`Álbum ID: ${albumId} deletado pelo usuário ID: ${userId}`);
        return true;
      } else {
        Logger.info(
          `Álbum ID: ${albumId} não encontrado ou não pertence ao usuário ID: ${userId} para deleção.`
        );
        return false;
      }
    } catch (error) {
      Logger.error(
        `Erro ao deletar álbum ID (${albumId}) no repositório: ${error.message}`,
        error
      );
      throw new Error("Erro no servidor ao tentar deletar álbum.");
    }
  }

  async procurarPorIdDeUsuario(userId) {
    try {
      const albumsCollection = getCollection(COLLECTION_ALBUMS);
      if (!ObjectId.isValid(userId)) {
        Logger.warn(
          `Tentativa de buscar álbuns com userId inválido: ${userId}`
        );
        return [];
      }
      const albums = await albumsCollection.find({ userId: userId }).toArray();
      Logger.info(
        `Encontrados ${albums.length} álbuns para o usuário ID: ${userId}`
      );
      return albums;
    } catch (error) {
      Logger.error(
        `Erro ao buscar álbuns por usuário ID (${userId}) no repositório: ${error.message}`,
        error
      );
      throw new Error("Erro no servidor ao tentar buscar álbuns do usuário.");
    }
  }
}

module.exports = AlbumRepositorio;
