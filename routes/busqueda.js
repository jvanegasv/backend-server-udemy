var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

// rutas
app.get('/todo/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;

    var regExp = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(regExp),
            buscarMedicos(regExp),
            buscarUsuarios(regExp)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        });

});

function buscarHospitales(regExp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regExp })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales: ', err);
                } else {
                    resolve(hospitales);
                }
            })

    });

}

function buscarMedicos(regExp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regExp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos: ', err);
                } else {
                    resolve(medicos);
                }
            })

    });

}

function buscarUsuarios(regExp) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([
                { nombre: regExp },
                { email: regExp }
            ])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios: ', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
}

module.exports = app;