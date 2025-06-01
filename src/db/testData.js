const db = require('../infraestrutura/persistencia/db');
const UsuarioService = require('../application/UsuarioService');
const Logger = require('../infraestrutura/logs/Logger');
const AlbumService = require('../application/AlbumService');
const FotoService = require('../application/FotoService');
const GerenciadorDeArquivos = require('../infraestrutura/arquivos/GerenciadorDeArquivos');
const fs = require('fs');
const path = require('path'); // Para construir caminhos
const { Buffer } = require('buffer'); // Para criar um Buffer de teste
Logger.debug = true;

class TestData {
    constructor() {
        this.usuarioServico = new UsuarioService();
        this.albumServico = new AlbumService();
        this.fotoService = new FotoService(); // Instanciando o fotoService
        this.gerenciadorDeArquivos = new GerenciadorDeArquivos();
    }

    async createData() {
        Logger.info('Iniciando a criação de dados de teste...');
        const connection = await db.connectDB();

        // Limpeza inicial mais robusta
        Logger.info('Limpando coleções existentes (users, albums, fotos)...');
        await connection.collection('usuarios').deleteMany({});
        await connection.collection('albums').deleteMany({});
        await connection.collection('fotos').deleteMany({}); // Usando 'documents' como no seu original
        Logger.info('Coleções limpas.');

        // Limpeza da pasta de uploads (CUIDADO: apenas para ambiente de teste)
        // Define o caminho base dos uploads como no GerenciadorDeArquivos
        const PASTA_BASE_UPLOADS_TESTE = path.resolve(__dirname, '..', 'uploads'); // Ajuste se o __dirname aqui for diferente da raíz do projeto
        try {
            Logger.info(`Limpando pasta de uploads de teste: ${PASTA_BASE_UPLOADS_TESTE}`);
            await fs.rm(PASTA_BASE_UPLOADS_TESTE, { recursive: true, force: true }, (err) => {
                if (err) {
                    Logger.error(`Erro ao limpar pasta de uploads de teste: ${err.message}`, err);
                } else {
                    Logger.info('Pasta de uploads de teste limpa com sucesso.');
                }
            });
            Logger.info('Pasta de uploads de teste limpa (ou não existia).');
            // Recria a pasta base para que o GerenciadorDeArquivos possa usá-la
            await fs.mkdir(PASTA_BASE_UPLOADS_TESTE, { recursive: true });
        } catch (erroLimpezaUploads) {
            Logger.warn(`Aviso ao limpar pasta de uploads de teste: ${erroLimpezaUploads.message}`);
        }


        // --- Testando UsuarioServico ---
        Logger.info('Testando UsuarioServico...');
        const usuarioAna = await this.usuarioServico.registrarUsuario({
            nome: "ana_silva",
            email: "ana.silva@example.com",
            senha: "senha_ana_original", // Senhas devem ser tratadas com hash no serviço real
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
            const primeiroUsuario = await this.usuarioServico.procurarUsuarioPorId(usuarios[0]._id);
            if (primeiroUsuario) {
                Logger.info(`Primeiro usuário encontrado por ID: ${primeiroUsuario.nome}`);
                await this.usuarioServico.atualizarUsuario(primeiroUsuario._id, {
                    nome: primeiroUsuario.nome + "_atualizado",
                });
                Logger.info(`Primeiro usuário atualizado.`);
            }
        }
        // Não vamos deletar todos os usuários agora para poder usá-los nos testes de álbum e foto

        // --- Testando AlbumServico ---
        Logger.info('Testando AlbumServico...');
        const albumAna1 = await this.albumServico.criarAlbum({
            nome: "Férias na Praia 2024 (Ana)",
            descricao: "Fotos incríveis das férias de verão.",
            urlFotoCapa: "/uploads/ana/praia_capa.jpg"
        }, usuarioAna._id);
        Logger.info(`Álbum 1 de Ana criado com ID: ${albumAna1._id}`);

        const albumAna2 = await this.albumServico.criarAlbum({
            nome: "Paisagens Urbanas (Ana)",
            descricao: "Explorando a arquitetura da cidade.",
            urlFotoCapa: "/uploads/ana/urbana_capa.jpg"
        }, usuarioAna._id);
        Logger.info(`Álbum 2 de Ana criado com ID: ${albumAna2._id}`);

        const albumCarlos1 = await this.albumServico.criarAlbum({
            nome: "Aventuras na Montanha (Carlos)",
            descricao: "Trilhas e vistas espetaculares.",
            urlFotoCapa: "/uploads/carlos/montanha_capa.jpg"
        }, usuarioCarlos._id);
        Logger.info(`Álbum 1 de Carlos criado com ID: ${albumCarlos1._id}`);

        let albunsDeAna = await this.albumServico.procurarAlbumPorIdUsuario(usuarioAna._id);
        Logger.info(`Ana possui ${albunsDeAna.length} álbuns.`);

        if (albunsDeAna.length > 0) {
            const primeiroAlbumAna = await this.albumServico.procurarAlbumPorId(albunsDeAna[0]._id, usuarioAna._id);
            if (primeiroAlbumAna) {
                Logger.info(`Primeiro álbum de Ana encontrado: ${primeiroAlbumAna.nome}`);
                await this.albumServico.atualizarAlbum(primeiroAlbumAna._id, usuarioAna._id, {
                    nome: primeiroAlbumAna.nome + " (Editado)",
                    descricao: "Esta é uma nova descrição para o álbum de férias."
                });
                Logger.info(`Primeiro álbum de Ana atualizado.`);
            }
        }

        // --- Testando GerenciadorDeArquivos Diretamente ---
        Logger.info('Testando GerenciadorDeArquivos diretamente...');
        let caminhoArquivoTesteSalvo;
        try {
            const bufferTeste = Buffer.from('Este é um arquivo de teste para o GerenciadorDeArquivos!');
            const nomeArquivoTeste = 'arquivo_teste_direto.txt';
            const subpastaTeste = 'testes_diretos';

            caminhoArquivoTesteSalvo = await this.gerenciadorDeArquivos.salvar(bufferTeste, nomeArquivoTeste, subpastaTeste);
            Logger.info(`GerenciadorDeArquivos.salvar: Arquivo salvo em: ${caminhoArquivoTesteSalvo}`);

            // Verificar se o arquivo físico existe
            // O caminho relativo retornado é /uploads/subpasta/arquivo.ext
            // Precisamos construir o caminho absoluto para verificar no sistema de arquivos
            let caminhoAbsolutoVerificacao = path.join(PASTA_BASE_UPLOADS_TESTE, subpastaTeste, nomeArquivoTeste);
            if (process.platform === "win32" && caminhoArquivoTesteSalvo.startsWith('/uploads/')) { // Ajuste específico para Windows se necessário
                caminhoAbsolutoVerificacao = path.join(PASTA_BASE_UPLOADS_TESTE, ...caminhoArquivoTesteSalvo.substring('/uploads/'.length).split('/'));
            }


            await fs.access(caminhoAbsolutoVerificacao, () => {
                Logger.info(`Arquivo ${caminhoAbsolutoVerificacao} existe fisicamente.`);
            });
            Logger.info(`VERIFICAÇÃO: Arquivo ${caminhoAbsolutoVerificacao} existe fisicamente.`);

            // Testar deleção
            const deletado = await this.gerenciadorDeArquivos.deletar(caminhoArquivoTesteSalvo);
            if (deletado) {
                Logger.info(`GerenciadorDeArquivos.deletar: Arquivo ${caminhoArquivoTesteSalvo} deletado com sucesso.`);
                try {
                    await fs.access(caminhoAbsolutoVerificacao, () => {
                        Logger.error(`ERRO DE VERIFICAÇÃO: Arquivo ${caminhoAbsolutoVerificacao} ainda existe após deleção!`);
                    });
                    Logger.error(`ERRO DE VERIFICAÇÃO: Arquivo ${caminhoAbsolutoVerificacao} ainda existe após deleção!`);
                } catch (erroAcessoAposDelecao) {
                    if (erroAcessoAposDelecao.code === 'ENOENT') {
                        Logger.info(`VERIFICAÇÃO: Arquivo ${caminhoAbsolutoVerificacao} não existe mais fisicamente (correto).`);
                    } else {
                        throw erroAcessoAposDelecao;
                    }
                }
            } else {
                Logger.error(`ERRO: GerenciadorDeArquivos.deletar falhou para ${caminhoArquivoTesteSalvo}`);
            }
        } catch (erroGerenciador) {
            Logger.error(`ERRO no teste direto do GerenciadorDeArquivos: ${erroGerenciador.message}`, erroGerenciador);
        }
        // Testar deleção de arquivo inexistente
        try {
            const deletadoNaoExistente = await this.gerenciadorDeArquivos.deletar('/uploads/nao_existe/arquivo_fantasma.txt');
            if (!deletadoNaoExistente) {
                Logger.info('GerenciadorDeArquivos.deletar: Corretamente retornou false para arquivo inexistente.');
            } else {
                Logger.error('ERRO: GerenciadorDeArquivos.deletar retornou true para arquivo inexistente.');
            }
        } catch (erroDelNaoExiste) {
            Logger.error(`ERRO inesperado ao tentar deletar arquivo inexistente: ${erroDelNaoExiste.message}`);
        }

        // --- Testando fotoService ---
        Logger.info('Testando fotoService...');

        // Upload de fotos para Ana
        const imageBuffer = fs.readFileSync(path.join(__dirname, 'teste', 'pordosol_praia.jpg'));
        const fotoPraiaAna = await this.fotoService.fazerUploadFoto({
            nomeArquivo: "pordosol_praia.jpg",
            urlArmazenamento: "/ana/album1/pordosol_praia.jpg", // Simula URL após upload físico
            tipoMime: "image/jpeg",
            tamanho: 2048000,
            titulo: "Pôr do Sol na Praia",
            descricao: "Lindo pôr do sol durante as férias.",
            tags: ["praia", "pôr do sol", "férias", "verão"],
            albumIds: [albumAna1._id],
            data: imageBuffer
        }, usuarioAna._id);
        Logger.info(`Foto 'Pôr do Sol na Praia' (ID: ${fotoPraiaAna._id}) adicionada ao álbum ${albumAna1._id} de Ana.`);

        const imageBuffer2 = fs.readFileSync(path.join(__dirname, 'teste', 'predio-antigo.jpg'));
        const fotoUrbanaAna = await this.fotoService.fazerUploadFoto({
            nomeArquivo: "predio-antigo.jpg",
            urlArmazenamento: "/ana/album2/predio-antigo.jpg",
            tipoMime: "image/jpeg",
            tamanho: 1500000,
            titulo: "Prédio Histórico",
            descricao: "Detalhes da arquitetura antiga.",
            tags: ["cidade", "arquitetura", "histórico"],
            albumIds: [albumAna2._id],
            data: imageBuffer2
        }, usuarioAna._id);
        Logger.info(`Foto 'Prédio Histórico' (ID: ${fotoUrbanaAna._id}) adicionada ao álbum ${albumAna2._id} de Ana.`);


        const imageBuffer3 = fs.readFileSync(path.join(__dirname, 'teste', 'trilha_floresta.jpg'));
        const fotoNaturezaAna = await this.fotoService.fazerUploadFoto({
            nomeArquivo: "trilha_floresta.jpg",
            urlArmazenamento: "/ana/geral/trilha_floresta.jpg",
            tipoMime: "image/jpeg",
            tamanho: 2200000,
            titulo: "Trilha na Floresta",
            descricao: "Caminhada matinal.",
            tags: ["natureza", "floresta", "trilha", "aventura"],
            albumIds: [], // Foto sem álbum inicialmente
            data: imageBuffer3
        }, usuarioAna._id);
        Logger.info(`Foto 'Trilha na Floresta' (ID: ${fotoNaturezaAna._id}) adicionada por Ana sem álbum.`);


        // Upload de foto para Carlos
        const imageBuffer4 = fs.readFileSync(path.join(__dirname, 'teste', 'vista_do_cume.jpg'));
        const fotoMontanhaCarlos = await this.fotoService.fazerUploadFoto({
            nomeArquivo: "vista_do_cume.jpg",
            urlArmazenamento: "/carlos/album1/vista_do_cume.jpg",
            tipoMime: "image/jpeg",
            tamanho: 3000000,
            titulo: "Vista do Cume da Montanha",
            descricao: "Paisagem incrível após a subida.",
            tags: ["montanha", "aventura", "paisagem", "trilha"],
            albumIds: [albumCarlos1._id],
            data: imageBuffer4
        }, usuarioCarlos._id);
        Logger.info(`Foto 'Vista do Cume' (ID: ${fotoMontanhaCarlos._id}) adicionada ao álbum ${albumCarlos1._id} de Carlos.`);

        try {
            const fotoAna = fs.readFileSync(path.join(__dirname, 'saida', 'pordosol_praia.jpg'));
            if (fotoAna) {
            fs.rm(path.join(__dirname, 'saida', 'pordosol_praia.jpg'), { force: true }, (err) => {
                if (err) {
                    Logger.error(`Erro ao remover arquivo de teste: ${err.message}`, err);
                } else {
                    Logger.info('Arquivo de teste removido com sucesso.');
                }
            });
        }
        } catch (erroFotoAna) {
            Logger.error(`Erro ao ler foto de teste: ${erroFotoAna.message}`, erroFotoAna);
        }

        // Testando buscas de fotos
        Logger.info(`Buscando foto por ID: ${fotoPraiaAna._id}`);
        const fotoEncontrada = await this.fotoService.obterFotoPorId(fotoPraiaAna._id, usuarioAna._id);

        if (fotoEncontrada) {
            const outputPath = path.join(__dirname, 'saida', fotoEncontrada.filename);

            const buffer = Buffer.from(fotoEncontrada.data.buffer);

            fs.writeFileSync(outputPath, buffer);

            Logger.info('Imagem salva em:', outputPath);
        } else {
            Logger.error(`ERRO: Foto ${fotoPraiaAna._id} não encontrada por ID!`);
        }

        Logger.info(`Buscando fotos do usuário Ana (ID: ${usuarioAna._id})`);
        const fotosDeAna = await this.fotoService.obterFotosPorUsuarioId(usuarioAna._id);
        Logger.info(`Ana possui ${fotosDeAna.length} fotos.`);

        Logger.info(`Buscando fotos do Álbum 1 de Ana (ID: ${albumAna1._id})`);
        const fotosAlbumAna1 = await this.fotoService.obterFotosPorAlbumId(albumAna1._id);
        Logger.info(`O Álbum '${albumAna1.nome}' possui ${fotosAlbumAna1.length} fotos.`);

        Logger.info("Buscando fotos com a tag 'praia' ou 'montanha'");
        const fotosComTags = await this.fotoService.buscarFotosPorTags(["praia", "montanha"]);
        Logger.info(`Encontradas ${fotosComTags.length} fotos com as tags 'praia' ou 'montanha'.`);

        Logger.info("Buscando fotos com a tag 'aventura'");
        const fotosAventura = await this.fotoService.buscarFotosPorTags(["aventura"]);
        Logger.info(`Encontradas ${fotosAventura.length} fotos com a tag 'aventura'.`);


        // Testando atualização de foto
        Logger.info(`Atualizando dados da foto ID: ${fotoUrbanaAna._id}`);
        await this.fotoService.atualizarDadosFoto(fotoUrbanaAna._id, usuarioAna._id, {
            titulo: "Prédio Histórico (Renovado)",
            tags: ["cidade", "arquitetura", "histórico", "renovado"],
            // Adicionando a foto a um novo álbum e mantendo no antigo
            albumIds: [albumAna2._id, albumAna1._id]
        });
        const fotoUrbanaAtualizada = await this.fotoService.obterFotoPorId(fotoUrbanaAna._id, usuarioAna._id);
        if (fotoUrbanaAtualizada && fotoUrbanaAtualizada.titulo === "Prédio Histórico (Renovado)") {
            Logger.info(`Foto '${fotoUrbanaAtualizada.titulo}' atualizada com sucesso e agora em ${fotoUrbanaAtualizada.albumIds.length} álbuns.`);
        } else {
            Logger.error(`ERRO ao atualizar foto ${fotoUrbanaAna._id} ou buscar dados atualizados.`);
        }


        // Testando deleção de foto
        Logger.info(`Deletando foto ID: ${fotoNaturezaAna._id}`);
        const deletouFotoNatureza = await this.fotoService.deletarFoto(fotoNaturezaAna._id, usuarioAna._id);
        if (deletouFotoNatureza) {
            Logger.info(`Foto ${fotoNaturezaAna._id} deletada com sucesso.`);
            const verificarDelecao = await this.fotoService.obterFotoPorId(fotoNaturezaAna._id, usuarioAna._id);
            if (!verificarDelecao) {
                Logger.info("Confirmação: Foto não encontrada após deleção.");
            } else {
                Logger.error(`ERRO: Foto ${fotoNaturezaAna._id} ainda encontrada após tentativa de deleção!`);
            }
        } else {
            Logger.error(`ERRO ao deletar foto ${fotoNaturezaAna._id}.`);
        }

        // Testando deleção de um álbum que contém fotos
        // A lógica de deleção de fotos dentro do álbum deve estar no AlbumServico.deletarAlbum
        // ou ser tratada aqui (ex: buscar fotos do álbum e deletá-las antes de deletar o álbum).
        // Vamos assumir que o AlbumServico.deletarAlbum lida com isso ou as fotos ficam sem o albumId.
        if (albunsDeAna.length > 1) { // Garante que há pelo menos dois álbuns para Ana
            const albumParaDeletarComFotos = albunsDeAna[0]; // Pega o primeiro álbum que deve ter fotos
            Logger.info(`Tentando deletar álbum '${albumParaDeletarComFotos.nome}' (ID: ${albumParaDeletarComFotos._id}) que pode conter fotos.`);
            await this.albumServico.deletarAlbum(albumParaDeletarComFotos._id, usuarioAna._id);
            const fotosAposDeletarAlbum = await this.fotoService.obterFotosPorAlbumId(albumParaDeletarComFotos._id);
            if (fotosAposDeletarAlbum.length === 0) {
                Logger.info(`Confirmado: Nenhuma foto encontrada para o álbum ${albumParaDeletarComFotos._id} após sua deleção (ou as fotos foram desassociadas).`);
            } else {
                Logger.warn(`AVISO: ${fotosAposDeletarAlbum.length} fotos ainda associadas ao álbum ${albumParaDeletarComFotos._id} após sua deleção.`);
            }
        }


        // Limpeza final seletiva (opcional, ou deixar para a próxima execução limpar tudo no início)
        Logger.info(`Tentando deletar usuário Carlos (ID: ${usuarioCarlos._id}) e seus álbuns/fotos associados...`);
        // Você precisaria de uma lógica mais elaborada aqui se a deleção em cascata não for automática
        // Ex: buscar todos os álbuns de Carlos, deletar todas as fotos desses álbuns, depois deletar os álbuns, depois o usuário.
        // Para simplificar, o teste pode focar em verificar se a deleção do usuário funciona.
        // A deleção de álbuns/fotos associados dependerá da implementação dos seus serviços.
        const fotosDeCarlos = await this.fotoService.obterFotosPorUsuarioId(usuarioCarlos._id);
        for (const foto of fotosDeCarlos) {
            await this.fotoService.deletarFoto(foto._id, usuarioCarlos._id);
        }
        Logger.info(`${fotosDeCarlos.length} fotos de Carlos deletadas.`);
        const albunsDeCarlos = await this.albumServico.procurarAlbumPorIdUsuario(usuarioCarlos._id);
        for (const album of albunsDeCarlos) {
            await this.albumServico.deletarAlbum(album._id, usuarioCarlos._id);
        }
        Logger.info(`${albunsDeCarlos.length} álbuns de Carlos deletados.`);
        await this.usuarioServico.deletarUsuario(usuarioCarlos._id);
        Logger.info(`Usuário Carlos deletado.`);
        const verificarCarlos = await this.usuarioServico.procurarUsuarioPorId(usuarioCarlos._id);
        if (!verificarCarlos) {
            Logger.info("Confirmação: Usuário Carlos não encontrado após deleção.");
        } else {
            Logger.error("ERRO: Usuário Carlos ainda encontrado após deleção!");
        }


        Logger.info('Criação de dados de teste concluída.');
        return; // O return aqui finaliza a execução do método createData.
        // O código de insertMany para 'documents' abaixo dele não será executado.
        // Removi a seção de insertMany que estava comentada ou inacessível.
    }
}

const test = new TestData();
test.createData();