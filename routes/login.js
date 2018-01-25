var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

const GoogleAuth = require('google-auth-library');
// var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// autenticacion de google
app.post('/google', (req, res) => {

    var token = req.body.token || '';

    var client = new GoogleAuth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        },
        function(e, login) {

            if (e) {
                return res.status(400).json({
                    ok: false,
                    errors: e
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            res.status(200).json({
                ok: true,
                payload: payload
            });
        }
    );


});

// autenticacion normal
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // crear token
        usuarioDB.password = ';)';
        var token = jwt.sign({ usuario: usuarioDB },
            SEED, { expiresIn: 14400 } // expira en 4 horas (segundos)
        );

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });

    });

});

module.exports = app;