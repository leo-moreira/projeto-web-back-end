const EntidadeBase = require("../base/EntidadeBase");

class Album extends EntidadeBase{
  constructor(nome, descricao, urlFotoCapa, userId) {
    super();
    this.nome = nome;
    this.userId = userId;
    this.descricao = descricao;
    this.urlFotoCapa = urlFotoCapa;
  }
}

module.exports = Album;