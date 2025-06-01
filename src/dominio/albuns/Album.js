const Entidade = require("../entidade/entidade");

class Album extends Entidade{
  constructor(nome, descricao, urlFotoCapa, userId) {
    super();
    this.nome = nome;
    this.userId = userId;
    this.descricao = descricao;
    this.urlFotoCapa = urlFotoCapa;
  }
}

module.exports = Album;