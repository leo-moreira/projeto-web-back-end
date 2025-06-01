const fs = require("fs");
const path = require("path");
const Logger = require("../logs/Logger");

const PASTA_BASE_UPLOADS = path.resolve(__dirname, "..", "..", "..", "uploads");

class GerenciadorDeArquivos {
  constructor() {
    this.pastaBaseUploads = PASTA_BASE_UPLOADS;
    this._garantirPastaBaseExiste();
  }

  async _garantirPastaBaseExiste() {
    try {
      fs.access(this.pastaBaseUploads, (err) => {
        if (err) {
          Logger.warn(
            `Pasta base de uploads não encontrada: ${this.pastaBaseUploads}. Criando...`
          );
          throw err;
        }
      });
      Logger.info(`Pasta base de uploads já existe: ${this.pastaBaseUploads}`);
    } catch (erro) {
      if (erro.code === "ENOENT") {
        Logger.info(
          `Pasta base de uploads não encontrada. Criando: ${this.pastaBaseUploads}`
        );
        try {
          await fs.mkdir(this.pastaBaseUploads, { recursive: true });
          Logger.info(
            `Pasta base de uploads criada com sucesso: ${this.pastaBaseUploads}`
          );
        } catch (erroCriacao) {
          Logger.error(
            `Falha ao criar pasta base de uploads ${this.pastaBaseUploads}: ${erroCriacao.message}`,
            erroCriacao
          );
          throw new Error(
            `Falha crítica ao criar diretório base de uploads: ${erroCriacao.message}`
          );
        }
      } else {
        Logger.error(
          `Erro ao verificar pasta base de uploads ${this.pastaBaseUploads}: ${erro.message}`,
          erro
        );
        throw new Error(
          `Erro ao verificar diretório base de uploads: ${erro.message}`
        );
      }
    }
  }

  async salvar(bufferArquivo, nomeArquivoDestino, subpasta = "") {
    if (!Buffer.isBuffer(bufferArquivo)) {
      Logger.error(
        "Tentativa de salvar arquivo sem fornecer um buffer válido."
      );
      throw new Error("Dados do arquivo inválidos. Esperado um Buffer.");
    }
    if (
      !nomeArquivoDestino ||
      typeof nomeArquivoDestino !== "string" ||
      nomeArquivoDestino.trim() === ""
    ) {
      Logger.error("Tentativa de salvar arquivo sem nome de destino válido.");
      throw new Error("Nome do arquivo de destino inválido.");
    }

    const diretorioDestino = path.join(this.pastaBaseUploads, subpasta);
    const caminhoCompletoDestino = path.join(
      diretorioDestino,
      nomeArquivoDestino
    );

    try {
      await fs.mkdir(diretorioDestino, { recursive: true }, (erro) => {
        if (erro) {
          Logger.error(
            `Erro ao garantir diretório de destino: ${diretorioDestino}`,
            erro
          );
          throw new Error(
            `Não foi possível garantir o diretório de destino: ${erro.message}`
          );
        }
      });
      Logger.info(
        `Diretório de destino para salvar arquivo: ${diretorioDestino}`
      );

      await fs.writeFile(caminhoCompletoDestino, bufferArquivo, (erro) => {
        if (erro) {
          Logger.error(
            `Erro ao escrever arquivo no caminho: ${caminhoCompletoDestino}`,
            erro
          );
          throw new Error(
            `Não foi possível escrever o arquivo: ${erro.message}`
          );
        }
      });
      Logger.info(`Arquivo salvo com sucesso em: ${caminhoCompletoDestino}`);

      const caminhoRelativo = path
        .join("/uploads", subpasta, nomeArquivoDestino)
        .replace(/\\/g, "/");
      return caminhoRelativo;
    } catch (erro) {
      Logger.error(
        `Falha ao salvar o arquivo ${nomeArquivoDestino} em ${diretorioDestino}: ${erro.message}`,
        erro
      );
      // Armazenar log da exceção
      throw new Error(`Não foi possível salvar o arquivo: ${erro.message}`);
    }
  }

  async deletar(caminhoRelativoArquivo) {
    if (
      !caminhoRelativoArquivo ||
      typeof caminhoRelativoArquivo !== "string" ||
      caminhoRelativoArquivo.trim() === ""
    ) {
      Logger.error(
        "Tentativa de deletar arquivo com caminho relativo inválido.",
        { caminhoRelativoArquivo }
      );
      throw new Error("Caminho do arquivo para deleção inválido.");
    }

    let caminhoNoSistema = caminhoRelativoArquivo;
    if (caminhoRelativoArquivo.startsWith("/uploads/")) {
      caminhoNoSistema = caminhoRelativoArquivo.substring("/uploads/".length);
    } else if (caminhoRelativoArquivo.startsWith("uploads/")) {
      caminhoNoSistema = caminhoRelativoArquivo.substring("uploads/".length);
    }

    const caminhoAbsoluto = path.join(this.pastaBaseUploads, caminhoNoSistema);
    Logger.info(
      `Tentando deletar arquivo em caminho absoluto: ${caminhoAbsoluto}`
    );

    try {
      await fs.unlink(caminhoAbsoluto);
      Logger.info(`Arquivo deletado com sucesso: ${caminhoAbsoluto}`);
      return true;
    } catch (erro) {
      if (erro.code === "ENOENT") {
        Logger.warn(`Arquivo não encontrado para deleção: ${caminhoAbsoluto}`);
        return false;
      }
      Logger.error(
        `Erro ao deletar o arquivo ${caminhoAbsoluto}: ${erro.message}`,
        erro
      );
      throw new Error(`Não foi possível deletar o arquivo: ${erro.message}`);
    }
  }
}

module.exports = GerenciadorDeArquivos;
