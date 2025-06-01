# Projeto 1: Biblioteca de Acesso a Dados para Armazenamento de Fotos


<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Versão do Projeto" />
  <img src="https://img.shields.io/badge/license-ISC-blue.svg" alt="Licença" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.20.1-green.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB%20Driver-v6.16.0-green.svg" alt="MongoDB Driver" />
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange" alt="Status do Projeto" />
  <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Manutenção" />
</p>

**Instituição:** Universidade Tecnológica Federal do Paraná (UTFPR) - Campus Cornélio Procópio
**Disciplina:** Programação Web Back-End
**Professor(a):** Prof. Monique Emídio de Oliveira
**Temática Escolhida:** Armazenamento de fotos (como o Google Fotos), com foco em armazenamento e busca de fotos em álbuns.

## 1. Descrição do Projeto

Desenvolvimento de uma biblioteca de classes em Node.js para acesso a SGBDs, focada na temática de armazenamento de fotos. Implementa inserção, busca e deleção de dados, simulando funcionalidades de um serviço de armazenamento e organização de fotos em álbuns.

## 2. Tecnologias Utilizadas

* **Node.js**
* **MongoDB** (driver nativo v6.16.0)
* **JavaScript (CommonJS)**
* **Domain-Driven Design (DDD)** (conceitos aplicados na estrutura)

## 3. Estrutura do Projeto

Baseado em DDD, o projeto em `src/` organiza-se em:
* **`dominio/`**: Entidades (`Usuario`, `Album`, `Foto` herdando de `EntidadeBase`).
* **`application/`** (ou `aplicacao/`): Serviços de Aplicação (`UsuarioService`, `AlbumService`, `FotoService`).
* **`infraestrutura/`**: Detalhes técnicos.
    * `persistencia/`: Repositórios MongoDB e conexão (`db.js`). Coleções: `usuarios`, `albums`, `fotos`.
    * `logs/`: `Logger.js` para logs de eventos e erros.
    * `arquivos/`: `GerenciadorDeArquivos.js` para armazenamento físico na pasta `uploads/`.
* **`testesDeDados/`**: Script `testData.js` para carga e teste.

## 4. Funcionalidades Implementadas

* **Gerenciamento de Usuários:** CRUD completo.
* **Gerenciamento de Álbuns:** CRUD completo, listagem por usuário e controle de proprietário.
* **Gerenciamento de Fotos:** Upload (com salvamento de arquivo físico), CRUD de metadados, listagem por usuário/álbum, busca por tags e controle de proprietário.
* **Gerenciamento de Arquivos Físicos:** Salvamento e deleção de arquivos de fotos.

## 5. Requisitos Adicionais Atendidos

Conforme a proposta do projeto:
* Classes de entidade definidas (`Usuario`, `Album`, `Foto`).
* Implementação de tratamento de erros, logs de eventos e exceções (com `Logger.js` escrevendo erros em `log.txt`).
* Verificação de campos obrigatórios nos serviços de aplicação.
* Tratamento de exceções de bibliotecas externas.

## 6. Configuração e Execução

### 6.1. Pré-requisitos
* Node.js (v16.20.1 ou superior, conforme dependência do driver MongoDB).
* MongoDB (instalado e rodando).

### 6.2. Instalação
1.  Clone: `git clone git@github.com:leo-moreira/projeto-web-back-end.git && cd projeto-web-back-end`
2.  Dependências: `npm install`

### 6.3. Configuração
* MongoDB: Conexão em `src/infraestrutura/persistencia/db.js` (`mongodb://localhost:27017`, banco `bancoDeFotos`).
* Uploads: Pasta `uploads/` na raiz do projeto.

### 6.4. Script de Teste e Carga de Dados
Execute `node src/testesDeDados/testData.js` para popular o banco e testar os serviços.
O arquivo `src/main.js` apenas inicia a conexão com o banco.

## 7. Como Usar a Biblioteca (Exemplo)

```javascript
// Exemplo de uso (CommonJS)
const FotoServico = require('./src/application/FotoService'); // Ajuste o caminho
const db = require('./src/infraestrutura/persistencia/db');
const Logger = require('./src/infraestrutura/logs/Logger');
Logger.debug = true;

async function main() {
    await db.connectDB();
    const fotoServico = new FotoServico();
    try {
        // Ex: const fotos = await fotoServico.obterFotosPorUsuarioId('ID_VALIDO');
        // Logger.info('Fotos:', fotos);
    } catch (e) { Logger.error('Erro no exemplo:', e); }
}
main();
```