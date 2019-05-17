var fs = require('fs');

exports.error404 = function(err, req, res, next, errosPath) {
    console.log(JOSN.stringify(req));
    if (req.accepts('html')) {
        // Respond with html page.
        fs.readFile(errosPath, 'utf-8', function(err, page) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    }
    else if (req.accepts('json')) {
        // Respond with json.
        res.status(404).send({ error: 'Recurso não encotrado!' });
    }
    else {
        // Default to plain-text. send()
        res.status(404).type('txt').send('Recurso não encotrado!');
    }
};

exports.error500 = function(err, req, res, next, errosPath) {
    if (req.accepts('html')) {
        // Respond with html page.
        fs.readFile(errosPath, 'utf-8', function(err, page) {
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.write(page);
            res.end();
        });
    }
    else if (req.accepts('json')) {
        // Respond with json.
        res.status(500).send({ error: 'Recurso não encotrado!' });
    }
    else {
        // Default to plain-text. send()
        res.status(500).type('txt').send('Recurso não encotrado!');
    }
};
