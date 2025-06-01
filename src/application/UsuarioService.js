const UsuarioRepositorio = require("../infraestrutura/persistencia/UsuarioRepositorio");
const Logger = require("../infraestrutura/logs/Logger");
const { Usuario } = require("../domain/usuarios/usuarios");

class UsuarioService {
  constructor() {
    this.userRepository = new UsuarioRepositorio();
  }

  async registrarUsuario(userData) {
    const usuario = new Usuario(userData.nome, userData.email, userData.senha);
    try {
      if (!usuario.nome || !usuario.email || !usuario.senha) {
        Logger.warn("Tentativa de registro com dados incompletos.", usuario);
        throw new Error("Nome de usuário, email e senha são obrigatórios.");
      }

      const existingUserByEmail = await this.userRepository.procurarPorEmail(
        usuario.email
      );
      if (existingUserByEmail) {
        Logger.warn(
          `Tentativa de registro com email já existente: ${usuario.email}`
        );
        throw new Error("Email já cadastrado.");
      }

      const createdUser = await this.userRepository.criar(usuario);
      Logger.info(`Usuário registrado com sucesso: ${createdUser.email}`);
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      Logger.error(
        `Erro no serviço ao registrar usuário: ${error.message}`,
        error
      );
      throw error;
    }
  }

  async procurarUsuarioPorId(userId) {
    try {
      const user = await this.userRepository.procurarPorId(userId);
      if (!user) {
        Logger.info(`Usuário não encontrado no serviço com ID: ${userId}`);
        return null;
      }
      Logger.info(`Usuário recuperado no serviço com ID: ${userId}`);
      delete user.password;
      return user;
    } catch (error) {
      Logger.error(
        `Erro no serviço ao buscar usuário por ID: ${userId} - ${error.message}`,
        error
      );
      throw error;
    }
  }

  async procurarUsuarioPorEmail(email) {
    try {
      const user = await this.userRepository.procurarPorEmail(email);
      if (!user) {
        Logger.info(`Usuário não encontrado no serviço com email: ${email}`);
        return null;
      }
      Logger.info(`Usuário recuperado no serviço com email: ${email}`);
      delete user.password;
      return user;
    } catch (error) {
      Logger.error(
        `Erro no serviço ao buscar usuário por email: ${email} - ${error.message}`,
        error
      );
      throw error;
    }
  }

  async procurarTodosOsUsuarios() {
    try {
      const users = await this.userRepository.procurarTodos();
      Logger.info(`Total de usuários recuperados no serviço: ${users.length}`);
      return users.map((user) => {
        delete user.password;
        return user;
      });
    } catch (error) {
      Logger.error(
        `Erro no serviço ao buscar todos os usuários: ${error.message}`,
        error
      );
      throw error;
    }
  }

  async atualizarUsuario(userId, updateData) {
    try {
      const updatedUser = await this.userRepository.atualizar(
        userId,
        updateData
      );
      if (!updatedUser) {
        Logger.info(
          `Usuário não encontrado para atualização no serviço: ${userId}`
        );
        return null;
      }
      Logger.info(`Usuário atualizado no serviço: ${userId}`);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      Logger.error(
        `Erro no serviço ao atualizar usuário ${userId}: ${error.message}`,
        { originalError: error, updateData }
      );
      throw error;
    }
  }

  async deletarUsuario(userId) {
    try {
      const success = await this.userRepository.deletar(userId);
      if (success) {
        Logger.info(`Usuário deletado no serviço: ${userId}`);
      } else {
        Logger.info(
          `Usuário não encontrado para deleção no serviço: ${userId}`
        );
      }
      return success;
    } catch (error) {
      Logger.error(
        `Erro no serviço ao deletar usuário ${userId}: ${error.message}`,
        error
      );
      throw error;
    }
  }
}

module.exports = UsuarioService;
