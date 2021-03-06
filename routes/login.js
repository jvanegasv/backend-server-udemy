var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middleware/autenticacion');

app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario },
        SEED, { expiresIn: 14400 } // expira en 4 horas (segundos)
    );
    res.status(200).json({
        ok: true,
        token: token
    });
});


// autenticacion de google
const GoogleAuth = require('google-auth-library');

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;
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

            Usuario.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario',
                        errors: e
                    });
                }

                if (usuario) {
                    if (!usuario.google) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Debe utilizar la autenticacion normal'
                        });
                    } else {

                        // crear token
                        usuario.password = ';)';
                        var token = jwt.sign({ usuario: usuario },
                            SEED, { expiresIn: 14400 } // expira en 4 horas (segundos)
                        );

                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            id: usuario._id,
                            token: token,
                            role: obtenerMenu(usuario.role)
                        });
                    }
                } else {

                    // Si no existe el usuario, lo creamos
                    var usuario = new Usuario();
                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al crear el usuario'
                            });
                        }

                        var token = jwt.sign({ usuario: usuarioDB },
                            SEED, { expiresIn: 14400 } // expira en 4 horas (segundos)
                        );

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            id: usuarioDB._id,
                            token: token,
                            role: obtenerMenu(usuarioDB.role)
                        });

                    });
                }
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
            token: token,
            role: obtenerMenu(usuarioDB.role)
        });

    });

});

function obtenerMenu(ROLE) {

    menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RXJS', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimoentos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }

    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;