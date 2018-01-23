var express = require('express');
var fileUpload = require('express-fileupload');

var app = express();

// default options
app.use(fileUpload());

// rutas
app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // validar tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Coleccion no valida (' + tiposValidos.join(',') + ')' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No arhivo seleccionado',
            errors: { message: 'No archivo seleccionado' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // validar extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Extension no valida (' + extensionesValidas.join(',') + ')' }
        });
    }

    // nombre de archivo personalizado
    // userId-XXX.extension
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo}`;

    // move archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo}`;
    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }
    });

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion qap',
        nombreCortado: nombreCortado,
        extensionArchivo: extensionArchivo,
        nombreArchivo: nombreArchivo
    });

});

module.exports = app;