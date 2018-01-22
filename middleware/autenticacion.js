var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// verificar token

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;
    if (!token) {
        token = req.get('authorization').replace('Bearer ', '');
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