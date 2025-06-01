const Entidade = require('../entidade/entidade');

class Usuario extends Entidade {
    constructor(nome, email, senha) {
        super();
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }
}

module.exports = { Usuario };