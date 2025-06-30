const UsuarioRepositorio = require("../src/infraestrutura/persistencia/UsuarioRepositorio");
const bcrypt = require("bcryptjs");

class User {
  static async findByEmail(email) {
    const userRepo = new UsuarioRepositorio();
    return await userRepo.procurarPorEmail(email);
  }

  static async comparePassword(senhaFornecida, senhaNoBanco) {
    return await bcrypt.compare(senhaFornecida, senhaNoBanco);
  }
}

module.exports = User;
