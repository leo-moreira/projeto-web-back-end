const User = require("../models/User");
const FotoRepositorio = require("../src/infraestrutura/persistencia/FotoRepositorio");

exports.getLoginPage = (req, res) => {
  res.render("login", { layout: "layout" });
};

exports.postLogin = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (user && (await User.comparePassword(senha, user.senha))) {
      req.session.logado = true;
      req.session.userId = user._id;
      req.session.userName = user.nome;

      res.redirect("/dashboard");
    } else {
      res.send(
        'Usuário ou senha inválidos. <a href="/login">Tentar de novo</a>'
      );
    }
  } catch (error) {
    console.error(error);
    res.send("Ocorreu um erro durante o login.");
  }
};


exports.getDashboardPage = async (req, res) => {
  const fotoRepo = new FotoRepositorio();
  const fotos = await fotoRepo.buscarPorUsuarioId(req.session.userId);

  res.render("dashboard", {
    layout: "layout",
    userName: req.session.userName,
    fotos: fotos,
  });
};

exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/login");
  });
};
