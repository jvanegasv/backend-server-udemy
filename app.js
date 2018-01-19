// Requires
var express = require('express');
var mongoose = require('mongoose');

// incializar variables
var app = express();

// conexion to mongo
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('Mongo: \x1b[32m%s\x1b[0m', 'online');
});
// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion qap'
    });

});

// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server pto 3000: \x1b[32m%s\x1b[0m', 'online');
});