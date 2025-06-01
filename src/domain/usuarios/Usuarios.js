const EntidadeBase = require('../base/EntidadeBase');

class Usuario extends EntidadeBase {
    constructor(nome, email, senha) {
        super();
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }
}

module.exports = { Usuario };