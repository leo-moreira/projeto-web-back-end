const { ObjectId } = require("mongodb");
const FotoRepositorio = require("../infraestrutura/persistencia/FotoRepositorio");
const Logger = require("../infraestrutura/logs/Logger");
const Foto = require("../domain/fotos/Foto");
const GerenciadorDeArquivos = require("../infraestrutura/arquivos/GerenciadorDeArquivos");

class FotoService {
  constructor() {
    this.fotoRepositorio = new FotoRepositorio();
    this.gerenciadorDeArquivos = new GerenciadorDeArquivos();
  }

  async fazerUploadFoto(dadosUpload, usuarioId) {
    try {
      if (
        !usuarioId ||
        !dadosUpload.nomeArquivo ||
        !dadosUpload.urlArmazenamento ||
        !dadosUpload.tipoMime ||
        !dadosUpload.tamanho
      ) {
        Logger.warn("Tentativa de upload de foto com dados incompletos.", {
          dadosUpload,
          usuarioId,
        });
        throw new Error(
          "ID do usuário, nome do arquivo, URL de armazenamento, tipo MIME e tamanho são obrigatórios."
        );
      }
      if (!ObjectId.isValid(usuarioId)) {
        Logger.warn(
          `ID de usuário inválido ao tentar fazer upload de foto: ${usuarioId}`
        );
        throw new Error("ID de usuário inválido.");
      }
      if (
        dadosUpload.albumIds &&
        !dadosUpload.albumIds.every((id) => ObjectId.isValid(id))
      ) {
        Logger.warn("Um ou mais IDs de álbum são inválidos.", {
          albumIds: dadosUpload.albumIds,
        });
        throw new Error("Um ou mais IDs de álbum fornecidos são inválidos.");
      }

      const foto = new Foto(
        usuarioId,
        dadosUpload.albumIds,
        dadosUpload.titulo,
        dadosUpload.descricao,
        dadosUpload.nomeArquivo,
        dadosUpload.urlArmazenamento,
        dadosUpload.tipoMime,
        dadosUpload.tamanho,
        dadosUpload.tags,
        new Date(),
        dadosUpload.metadados,
        dadosUpload.data
      );

      const fotoCriada = await this.fotoRepositorio.criar(foto);
      await this.gerenciadorDeArquivos.salvar(
        Buffer.from(dadosUpload.data),
        dadosUpload.nomeArquivo,
        usuarioId.toHexString()
      );
      Logger.info(
        `Foto ID: ${fotoCriada._id} processada pelo serviço de upload para o usuário ${usuarioId}.`
      );
      return fotoCriada;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao fazer upload de foto para o usuário ${usuarioId}: ${erro.message}`,
        { originalError: erro, dadosUpload }
      );
      throw erro;
    }
  }

  async obterFotoPorId(fotoId) {
    try {
      if (!ObjectId.isValid(fotoId)) {
        Logger.warn(`ID de foto inválido na busca: ${fotoId}`);
        throw new Error("ID de foto inválido.");
      }
      const foto = await this.fotoRepositorio.procurarPorId(fotoId);
      if (!foto) {
        Logger.info(`Foto não encontrada no serviço com ID: ${fotoId}`);
        return null;
      }

      Logger.info(`Foto ID: ${fotoId} recuperada no serviço.`);
      return foto;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao buscar foto por ID (${fotoId}): ${erro.message}`,
        erro
      );
      throw erro;
    }
  }

  async obterFotosPorUsuarioId(usuarioId) {
    try {
      if (!ObjectId.isValid(usuarioId)) {
        Logger.warn(`ID de usuário inválido ao buscar fotos: ${usuarioId}`);
        throw new Error("ID de usuário inválido.");
      }
      const fotos = await this.fotoRepositorio.buscarPorUsuarioId(usuarioId);
      Logger.info(
        `Recuperadas ${fotos.length} fotos para o usuário ${usuarioId} no serviço.`
      );
      return fotos;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao buscar fotos do usuário ${usuarioId}: ${erro.message}`,
        erro
      );
      throw erro;
    }
  }

  async obterFotosPorAlbumId(albumId) {
    try {
      if (!ObjectId.isValid(albumId)) {
        Logger.warn(`ID de álbum inválido ao buscar fotos: ${albumId}`);
        throw new Error("ID de álbum inválido.");
      }
      const fotos = await this.fotoRepositorio.buscarPorAlbumId(albumId);
      Logger.info(
        `Recuperadas ${fotos.length} fotos para o álbum ${albumId} no serviço.`
      );
      return fotos;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao buscar fotos do álbum ${albumId}: ${erro.message}`,
        erro
      );
      throw erro;
    }
  }

  async buscarFotosPorTags(tags) {
    try {
      if (
        !Array.isArray(tags) ||
        tags.some((tag) => typeof tag !== "string" || tag.trim() === "")
      ) {
        Logger.warn("Tentativa de buscar fotos com tags inválidas.", { tags });
        throw new Error("As tags devem ser um array de strings não vazias.");
      }
      const fotos = await this.fotoRepositorio.buscarPorTags(
        tags.map((tag) => tag.trim()).filter((tag) => tag)
      );
      Logger.info(
        `Busca por tags [${tags.join(",")}] no serviço resultou em ${
          fotos.length
        } fotos.`
      );
      return fotos;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao buscar fotos por tags: ${erro.message}`,
        erro
      );
      throw erro;
    }
  }

  async atualizarDadosFoto(fotoId, usuarioId, dadosAtualizacao) {
    try {
      if (!ObjectId.isValid(fotoId) || !ObjectId.isValid(usuarioId)) {
        Logger.warn(
          `ID de foto ou usuário inválido na atualização: FotoID ${fotoId}, UserID ${usuarioId}`
        );
        throw new Error("ID de foto ou usuário inválido.");
      }
      if (
        dadosAtualizacao.albumIds &&
        !dadosAtualizacao.albumIds.every((id) => ObjectId.isValid(id))
      ) {
        Logger.warn("Na atualização, um ou mais IDs de álbum são inválidos.", {
          albumIds: dadosAtualizacao.albumIds,
        });
        throw new Error(
          "Um ou mais IDs de álbum fornecidos para atualização são inválidos."
        );
      }
      if (dadosAtualizacao.albumIds) {
        dadosAtualizacao.albumIds = dadosAtualizacao.albumIds.map((id) => id);
      }

      const fotoAtualizada = await this.fotoRepositorio.atualizar(
        fotoId,
        usuarioId,
        dadosAtualizacao
      );
      if (!fotoAtualizada) {
        Logger.info(
          `Foto não encontrada ou não autorizada para atualização no serviço: FotoID ${fotoId}, UserID ${usuarioId}`
        );
        return null;
      }
      Logger.info(
        `Foto ID: ${fotoId} atualizada no serviço pelo usuário ${usuarioId}.`
      );
      return fotoAtualizada;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao atualizar foto ${fotoId} para usuário ${usuarioId}: ${erro.message}`,
        { originalError: erro, dadosAtualizacao }
      );
      throw erro;
    }
  }

  async deletarFoto(fotoId, usuarioId) {
    try {
      if (!ObjectId.isValid(fotoId) || !ObjectId.isValid(usuarioId)) {
        Logger.warn(
          `ID de foto ou usuário inválido na deleção: FotoID ${fotoId}, UserID ${usuarioId}`
        );
        throw new Error("ID de foto ou usuário inválido.");
      }

      const foto = await this.fotoRepositorio.procurarPorId(fotoId);
      if (!foto) {
        Logger.info(`Foto ID: ${fotoId} não encontrada para deleção.`);
        return false;
      }
      if (foto.userId.toString() !== usuarioId.toString()) {
        Logger.warn(
          `Usuário ${usuarioId} tentou deletar foto ${fotoId} que não lhe pertence.`
        );
        throw new Error(
          "Ação não autorizada. Você não é o proprietário desta foto."
        );
      }

      try {
        await this.gerenciadorDeArquivos.deletar(foto.storageUrl);
        Logger.info(
          `Arquivo físico ${foto.urlArmazenamento} deletado com sucesso.`
        );
      } catch (erroArquivo) {
        Logger.error(
          `Falha ao deletar arquivo físico ${foto.urlArmazenamento} para a foto ID ${fotoId}: ${erroArquivo.message}`,
          erroArquivo
        );
      }

      const sucesso = await this.fotoRepositorio.deletar(fotoId, usuarioId);

      if (sucesso) {
        Logger.info(
          `Foto ID: ${fotoId} deletada no serviço pelo usuário ${usuarioId}.`
        );
      } else {
        Logger.info(
          `Foto não encontrada ou não autorizada para deleção no serviço (passo do repositório): FotoID ${fotoId}, UserID ${usuarioId}.`
        );
      }
      return sucesso;
    } catch (erro) {
      Logger.error(
        `Erro no serviço ao deletar foto ${fotoId} para usuário ${usuarioId}: ${erro.message}`,
        erro
      );
      throw erro;
    }
  }
}

module.exports = FotoService;
