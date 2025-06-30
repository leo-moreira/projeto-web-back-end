exports.checkLogin = (req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/login');
    }
};