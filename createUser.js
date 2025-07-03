const {
  connectDB,
  getCollection,
} = require("./src/infraestrutura/persistencia/db");
const bcrypt = require("bcryptjs");

async function criarUsuario() {
  try {
    await connectDB();
    const usersCollection = getCollection("usuarios");

    const email = "teste@email.com";
    const userExists = await usersCollection.findOne({ email: email });

    if (userExists) {
      console.log("Usuário de teste já existe.");
      return;
    }

    const senha = "123";
    // Gera um "salt" e criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    await usersCollection.insertOne({
      nome: "Usuário Teste",
      email: email,
      senha: senhaHash,
      createdAt: new Date(),
    });

    console.log("Usuário de teste criado com sucesso!");
    console.log(`Email: ${email}`);
    console.log(`Senha: ${senha}`);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  } finally {
    process.exit();
  }
}

criarUsuario();
