//  modelo re ruta

var express = require('express');

var app = express();

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion qap'
    });

});

module.exports = app;