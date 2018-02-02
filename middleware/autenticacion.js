var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// verificar token

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;
    if (!token) {
        if (req.get('authorization')) {
            token = req.get('authorization').replace('Bearer ', '');
        } else {
            token = '';
        }
    }
    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token invalido',
                headers: req.get('authorization'),
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}

// verificar admin

exports.verificaADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es admin',
            headers: req.get('authorization'),
            errors: {
                message: 'No es administrador'
            }
        });
    }

}

// verificar admin

exports.verificaADMIN_o_MYSELF = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es admin o tu mismo',
            headers: req.get('authorization'),
            errors: {
                message: 'No es administrador o tu mismo'
            }
        });
    }

}