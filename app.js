// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// incializar variables
var app = express();

// bodyparser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var loginRoutes = require('./routes/login');

// conexion to mongo
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Mongo: \x1b[32m%s\x1b[0m', 'online');
});

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server pto 3000: \x1b[32m%s\x1b[0m', 'online');
});