const db = require("../infraestrutura/persistencia/db");
const path = require("path");
const fs = require("fs");
const UsuarioService = require("../application/UsuarioService");
const Logger = require("../infraestrutura/logs/Logger");
const AlbumService = require("../application/AlbumService");
const FotoService = require("../application/FotoService");
const GerenciadorDeArquivos = require("../infraestrutura/arquivos/GerenciadorDeArquivos");
Logger.debug = true;

class TestData {
  constructor() {
    this.usuarioServico = new UsuarioService();
    this.albumServico = new AlbumService();
    this.fotoService = new FotoService();
    this.gerenciadorDeArquivos = new GerenciadorDeArquivos();
  }

  async createData() {
    Logger.info("Iniciando a criação de dados de teste...");
    const connection = await db.connectDB();

    // Limpeza inicial
    await this.limparBanco(connection);

    // --- Testando UsuarioService ---
    const { usuarioAna, usuarioCarlos } = await this.testarUsuario();

    // --- Testando AlbumService ---
    var { albumAna1, albumAna2, albumCarlos1, albunsDeAna } =
      await this.testarAlbuns(usuarioAna, usuarioCarlos);

    // --- Testando UsuarioService ---
    await this.testarFotos(
      albumAna1,
      usuarioAna,
      albumAna2,
      albumCarlos1,
      usuarioCarlos,
      albunsDeAna
    );

    Logger.info("Dados de teste criados com sucesso.");
    return;
  }

  async testarFotos(
    albumAna1,
    usuarioAna,
    albumAna2,
    albumCarlos1,
    usuarioCarlos,
    albunsDeAna
  ) {
    Logger.info("Testando fotoService...");
    const imageBuffer = fs.readFileSync(
      path.join(__dirname, "teste", "pordosol_praia.jpg")
    );
    const fotoPraiaAna = await this.fotoService.fazerUploadFoto(
      {
        nomeArquivo: "pordosol_praia.jpg",
        urlArmazenamento: "/ana/album1/pordosol_praia.jpg",
        tipoMime: "image/jpeg",
        tamanho: 2048000,
        titulo: "Pôr do Sol na Praia",
        descricao: "Lindo pôr do sol durante as férias.",
        tags: ["praia", "pôr do sol", "férias", "verão"],
        albumIds: [albumAna1._id],
        data: imageBuffer,
      },
      usuarioAna._id
    );
    Logger.info(
      `Foto 'Pôr do Sol na Praia' (ID: ${fotoPraiaAna._id}) adicionada ao álbum ${albumAna1._id} de Ana.`
    );

    const imageBuffer2 = fs.readFileSync(
      path.join(__dirname, "teste", "predio-antigo.jpg")
    );
    const fotoUrbanaAna = await this.fotoService.fazerUploadFoto(
      {
        nomeArquivo: "predio-antigo.jpg",
        urlArmazenamento: "/ana/album2/predio-antigo.jpg",
        tipoMime: "image/jpeg",
        tamanho: 1500000,
        titulo: "Prédio Histórico",
        descricao: "Detalhes da arquitetura antiga.",
        tags: ["cidade", "arquitetura", "histórico"],
        albumIds: [albumAna2._id],
        data: imageBuffer2,
      },
      usuarioAna._id
    );
    Logger.info(
      `Foto 'Prédio Histórico' (ID: ${fotoUrbanaAna._id}) adicionada ao álbum ${albumAna2._id} de Ana.`
    );

    const imageBuffer3 = fs.readFileSync(
      path.join(__dirname, "teste", "trilha_floresta.jpg")
    );
    const fotoNaturezaAna = await this.fotoService.fazerUploadFoto(
      {
        nomeArquivo: "trilha_floresta.jpg",
        urlArmazenamento: "/ana/geral/trilha_floresta.jpg",
        tipoMime: "image/jpeg",
        tamanho: 2200000,
        titulo: "Trilha na Floresta",
        descricao: "Caminhada matinal.",
        tags: ["natureza", "floresta", "trilha", "aventura"],
        albumIds: [],
        data: imageBuffer3,
      },
      usuarioAna._id
    );
    Logger.info(
      `Foto 'Trilha na Floresta' (ID: ${fotoNaturezaAna._id}) adicionada por Ana sem álbum.`
    );

    const imageBuffer4 = fs.readFileSync(
      path.join(__dirname, "teste", "vista_do_cume.jpg")
    );
    const fotoMontanhaCarlos = await this.fotoService.fazerUploadFoto(
      {
        nomeArquivo: "vista_do_cume.jpg",
        urlArmazenamento: "/carlos/album1/vista_do_cume.jpg",
        tipoMime: "image/jpeg",
        tamanho: 3000000,
        titulo: "Vista do Cume da Montanha",
        descricao: "Paisagem incrível após a subida.",
        tags: ["montanha", "aventura", "paisagem", "trilha"],
        albumIds: [albumCarlos1._id],
        data: imageBuffer4,
      },
      usuarioCarlos._id
    );
    Logger.info(
      `Foto 'Vista do Cume' (ID: ${fotoMontanhaCarlos._id}) adicionada ao álbum ${albumCarlos1._id} de Carlos.`
    );

    // Testando buscas de fotos
    Logger.info(`Buscando fotos do usuário Ana (ID: ${usuarioAna._id})`);
    const fotosDeAna = await this.fotoService.obterFotosPorUsuarioId(
      usuarioAna._id
    );
    Logger.info(`Ana possui ${fotosDeAna.length} fotos.`);

    Logger.info(`Buscando fotos do Álbum 1 de Ana (ID: ${albumAna1._id})`);
    const fotosAlbumAna1 = await this.fotoService.obterFotosPorAlbumId(
      albumAna1._id
    );
    Logger.info(
      `O Álbum '${albumAna1.nome}' possui ${fotosAlbumAna1.length} fotos.`
    );

    Logger.info("Buscando fotos com a tag 'praia' ou 'montanha'");
    const fotosComTags = await this.fotoService.buscarFotosPorTags([
      "praia",
      "montanha",
    ]);
    Logger.info(
      `Encontradas ${fotosComTags.length} fotos com as tags 'praia' ou 'montanha'.`
    );

    Logger.info("Buscando fotos com a tag 'aventura'");
    const fotosAventura = await this.fotoService.buscarFotosPorTags([
      "aventura",
    ]);
    Logger.info(
      `Encontradas ${fotosAventura.length} fotos com a tag 'aventura'.`
    );

    // Testando atualização de foto
    Logger.info(`Atualizando dados da foto ID: ${fotoUrbanaAna._id}`);
    await this.fotoService.atualizarDadosFoto(
      fotoUrbanaAna._id,
      usuarioAna._id,
      {
        titulo: "Prédio Histórico (Renovado)",
        tags: ["cidade", "arquitetura", "histórico", "renovado"],
        albumIds: [albumAna2._id, albumAna1._id],
      }
    );
    const fotoUrbanaAtualizada = await this.fotoService.obterFotoPorId(
      fotoUrbanaAna._id,
      usuarioAna._id
    );
    if (
      fotoUrbanaAtualizada &&
      fotoUrbanaAtualizada.titulo === "Prédio Histórico (Renovado)"
    ) {
      Logger.info(
        `Foto '${fotoUrbanaAtualizada.titulo}' atualizada com sucesso e agora em ${fotoUrbanaAtualizada.albumIds.length} álbuns.`
      );
    } else {
      Logger.error(
        `ERRO ao atualizar foto ${fotoUrbanaAna._id} ou buscar dados atualizados.`
      );
    }

    // Testando deleção de foto
    Logger.info(`Deletando foto ID: ${fotoNaturezaAna._id}`);
    const deletouFotoNatureza = await this.fotoService.deletarFoto(
      fotoNaturezaAna._id,
      usuarioAna._id
    );
    if (deletouFotoNatureza) {
      Logger.info(`Foto ${fotoNaturezaAna._id} deletada com sucesso.`);
      const verificarDelecao = await this.fotoService.obterFotoPorId(
        fotoNaturezaAna._id,
        usuarioAna._id
      );
      if (!verificarDelecao) {
        Logger.info("Confirmação: Foto não encontrada após deleção.");
      } else {
        Logger.error(
          `ERRO: Foto ${fotoNaturezaAna._id} ainda encontrada após tentativa de deleção!`
        );
      }
    } else {
      Logger.error(`ERRO ao deletar foto ${fotoNaturezaAna._id}.`);
    }

    if (albunsDeAna.length > 1) {
      const albumParaDeletarComFotos = albunsDeAna[0];
      Logger.info(
        `Tentando deletar álbum '${albumParaDeletarComFotos.nome}' (ID: ${albumParaDeletarComFotos._id}) que pode conter fotos.`
      );
      await this.albumServico.deletarAlbum(
        albumParaDeletarComFotos._id,
        usuarioAna._id
      );
      const fotosAposDeletarAlbum = await this.fotoService.obterFotosPorAlbumId(
        albumParaDeletarComFotos._id
      );
      if (fotosAposDeletarAlbum.length === 0) {
        Logger.info(
          `Confirmado: Nenhuma foto encontrada para o álbum ${albumParaDeletarComFotos._id} após sua deleção (ou as fotos foram desassociadas).`
        );
      } else {
        Logger.warn(
          `AVISO: ${fotosAposDeletarAlbum.length} fotos ainda associadas ao álbum ${albumParaDeletarComFotos._id} após sua deleção.`
        );
      }
    }
  }

  async testarAlbuns(usuarioAna, usuarioCarlos) {
    Logger.info("Testando AlbumServico...");
    const albumAna1 = await this.albumServico.criarAlbum(
      {
        nome: "Férias na Praia 2024 (Ana)",
        descricao: "Fotos incríveis das férias de verão.",
        urlFotoCapa: "/uploads/ana/praia_capa.jpg",
      },
      usuarioAna._id
    );
    Logger.info(`Álbum 1 de Ana criado com ID: ${albumAna1._id}`);

    const albumAna2 = await this.albumServico.criarAlbum(
      {
        nome: "Paisagens Urbanas (Ana)",
        descricao: "Explorando a arquitetura da cidade.",
        urlFotoCapa: "/uploads/ana/urbana_capa.jpg",
      },
      usuarioAna._id
    );
    Logger.info(`Álbum 2 de Ana criado com ID: ${albumAna2._id}`);

    const albumCarlos1 = await this.albumServico.criarAlbum(
      {
        nome: "Aventuras na Montanha (Carlos)",
        descricao: "Trilhas e vistas espetaculares.",
        urlFotoCapa: "/uploads/carlos/montanha_capa.jpg",
      },
      usuarioCarlos._id
    );
    Logger.info(`Álbum 1 de Carlos criado com ID: ${albumCarlos1._id}`);

    let albunsDeAna = await this.albumServico.procurarAlbumPorIdUsuario(
      usuarioAna._id
    );
    Logger.info(`Ana possui ${albunsDeAna.length} álbuns.`);

    if (albunsDeAna.length > 0) {
      const primeiroAlbumAna = await this.albumServico.procurarAlbumPorId(
        albunsDeAna[0]._id,
        usuarioAna._id
      );
      if (primeiroAlbumAna) {
        Logger.info(
          `Primeiro álbum de Ana encontrado: ${primeiroAlbumAna.nome}`
        );
        await this.albumServico.atualizarAlbum(
          primeiroAlbumAna._id,
          usuarioAna._id,
          {
            nome: primeiroAlbumAna.nome + " (Editado)",
            descricao: "Esta é uma nova descrição para o álbum de férias.",
          }
        );
        Logger.info(`Primeiro álbum de Ana atualizado.`);
      }
    }
    return { albumAna1, albumAna2, albumCarlos1, albunsDeAna };
  }

  async testarUsuario() {
    Logger.info("Testando UsuarioServico...");
    const usuarioAna = await this.usuarioServico.registrarUsuario({
      nome: "ana_silva",
      email: "ana.silva@example.com",
      senha: "senha_ana_original",
    });
    Logger.info(`Usuário Ana criado com ID: ${usuarioAna._id}`);

    const usuarioCarlos = await this.usuarioServico.registrarUsuario({
      nome: "carlos_santos",
      email: "carlos.santos@example.com",
      senha: "senha_carlos_original",
    });
    Logger.info(`Usuário Carlos criado com ID: ${usuarioCarlos._id}`);

    let usuarios = await this.usuarioServico.procurarTodosOsUsuarios();
    Logger.info(`Total de usuários após criação inicial: ${usuarios.length}`);

    if (usuarios.length > 0) {
      const primeiroUsuario = await this.usuarioServico.procurarUsuarioPorId(
        usuarios[0]._id
      );
      if (primeiroUsuario) {
        Logger.info(
          `Primeiro usuário encontrado por ID: ${primeiroUsuario.nome}`
        );
        await this.usuarioServico.atualizarUsuario(primeiroUsuario._id, {
          nome: primeiroUsuario.nome + "_atualizado",
        });
        Logger.info(`Primeiro usuário atualizado.`);
      }
    }
    return { usuarioAna, usuarioCarlos };
  }

  async limparBanco(connection) {
    Logger.info("Limpando coleções existentes (users, albums, fotos)...");
    await connection.collection("usuarios").deleteMany({});
    await connection.collection("albums").deleteMany({});
    await connection.collection("fotos").deleteMany({});
    Logger.info("Coleções limpas.");
  }
}

const test = new TestData();
test.createData();
