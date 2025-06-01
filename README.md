# Projeto 1: Biblioteca de Acesso a Dados para Armazenamento de Fotos
---

**Instituição:** Universidade Tecnológica Federal do Paraná (UTFPR) - Campus Cornélio Procópio 
**Disciplina:** Programação Web Back-End 
**Professor(a):** Prof. Monique Emídio de Oliveira 
**Temática Escolhida:** Armazenamento de fotos (como o Google Fotos), com foco em armazenamento e busca de fotos em álbuns.

## 1. Descrição do Projeto

Este projeto consiste no desenvolvimento de um conjunto de classes (biblioteca) em Node.js para acesso a Sistemas de Gerenciamento de Banco de Dados (SGBDs). As classes desenvolvidas representam as entidades de um banco de dados focado na temática de armazenamento de fotos e implementam métodos para inserção, busca e deleção de dados.

O sistema visa simular funcionalidades de um serviço como o Google Fotos, permitindo o armazenamento de informações sobre fotos, sua organização em álbuns e a busca por essas fotos.

## 2. Tecnologias Utilizadas

* **Node.js:** Ambiente de execução JavaScript server-side.
* **MongoDB:** Banco de dados NoSQL orientado a documentos, utilizado com o driver nativo do MongoDB para Node.js.
* **JavaScript (ES Modules):** Linguagem de programação principal, utilizando a sintaxe de módulos ES.
* **Domain-Driven Design (DDD):** Conceitos aplicados para a estruturação do projeto, visando um código mais organizado e alinhado com as regras de negócio.

## 3. Estrutura do Projeto

O projeto foi estruturado seguindo princípios do Domain-Driven Design (DDD), dividido conceitualmente nas seguintes camadas e pastas principais dentro de `src/`:

* **`dominio/`**: Contém as entidades do negócio, objetos de valor e as interfaces dos repositórios.
    * `usuario/`: Entidade `Usuario` e sua interface de repositório.
    * `album/`: Entidade `Album` e sua interface de repositório.
    * `foto/`: Entidade `Foto` (representando os documentos/fotos) e sua interface de repositório.
* **`aplicacao/`**: Orquestra os casos de uso através dos Serviços de Aplicação, que utilizam os repositórios e entidades.
    * `UsuarioServico.js`
    * `AlbumServico.js`
    * `FotoServico.js`
* **`infraestrutura/`**: Implementações concretas e detalhes técnicos.
    * `persistencia/mongo/`: Implementações dos repositórios para MongoDB (`MongoUsuarioRepositorio.js`, etc.) e configuração da conexão (`db.js`).
    * `logging/`: Módulo de `Logger.js` para registro de logs de eventos e erros.
    * `arquivos/`: `GerenciadorDeArquivos.js` para lidar com o armazenamento físico das fotos.

## 4. Funcionalidades Implementadas

A biblioteca implementa as operações de CRUD (Criar, Ler, Atualizar, Deletar) para as seguintes entidades:

### 4.1. Usuário (`UsuarioServico`)
* Registro de novos usuários.
* Busca de usuários por ID e por email.
* Listagem de todos os usuários.
* Atualização de dados de usuários.
* Deleção de usuários.

### 4.2. Álbum (`AlbumServico`)
* Criação de novos álbuns para um usuário.
* Busca de álbuns por ID.
* Listagem de todos os álbuns de um usuário específico.
* Atualização de informações de um álbum (nome, descrição, foto de capa).
* Deleção de álbuns (garantindo que apenas o proprietário possa realizar a ação).

### 4.3. Foto/Documento (`FotoServico`)
* Upload (registro) de novas fotos, associadas a um usuário e opcionalmente a um ou mais álbuns.
* Busca de fotos por ID.
* Listagem de todas as fotos de um usuário específico.
* Listagem de todas as fotos de um álbum específico.
* Busca de fotos por tags.
* Atualização dos metadados de uma foto (título, descrição, tags, álbuns associados).
* Deleção de fotos (garantindo que apenas o proprietário possa realizar a ação e removendo o arquivo físico).

### 4.4. Gerenciamento de Arquivos (`GerenciadorDeArquivos`)
* Salvar arquivos (buffers) no sistema de arquivos local em uma estrutura de pastas organizada.
* Deletar arquivos físicos do sistema de arquivos.

## 5. Requisitos Adicionais Atendidos

Conforme a proposta do projeto, os seguintes requisitos foram contemplados:

* **Definição de Classes:** Foram definidas classes para representar as entidades `Usuario`, `Album` e `Foto` e para o armazenamento de suas informações.
* **Tratamento de Erros e Logs:** Implementação de rotinas para tratamento de exceções em todas as camadas e registro de logs de eventos e erros detalhados através de um módulo `Logger`.
* **Verificação de Campos Obrigatórios:** Os Serviços de Aplicação realizam a verificação do preenchimento de campos obrigatórios antes de prosseguir com as operações.
* **Tratamento de Exceções de Bibliotecas:** As exceções lançadas por bibliotecas externas (como o driver do MongoDB) são capturadas e tratadas adequadamente.
* **Armazenamento de Logs:** Os erros e eventos relevantes são registrados em arquivos de log (ou console, dependendo da configuração do `Logger`).

## 6. Configuração e Execução

### 6.1. Pré-requisitos
* Node.js (versão 18.x ou superior recomendada)
* MongoDB (instalado e o serviço `mongod` em execução na porta padrão 27017)

### 6.2. Instalação
1.  Clone o repositório:
    ```bash
    git clone git@github.com:leo-moreira/projeto-web-back-end.git
    cd projeto-web-back-end
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
    *(Se houver dependências como `mongodb`, adicione-as ao `package.json` e liste aqui)*

### 6.3. Configuração
* A string de conexão do MongoDB está configurada no arquivo `src/infraestrutura/persistencia/mongo/db.js` para `mongodb://localhost:27017`. O nome do banco de dados também é definido neste arquivo.
* A pasta base para upload de arquivos físicos é `uploads/` na raiz do projeto, gerenciada por `src/infraestrutura/arquivos/GerenciadorDeArquivos.js`.

### 6.4. Executando o Script de Teste e Carga de Dados
Para popular o banco de dados com dados de exemplo e testar as funcionalidades dos serviços, execute:
```bash
node testData.js