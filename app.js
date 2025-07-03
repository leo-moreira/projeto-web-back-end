const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const db = require('./src/infraestrutura/persistencia/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 3000;

db.connectDB();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(session({
    secret: 'meu-segredo-super-secreto-12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});