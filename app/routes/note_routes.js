var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
    app.get('/products/:id', (req, res) => {
        const id = req.params.id;
        const details = {'_id': new ObjectID(id)};
        db.collection('products').findOne(details, (err, item) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(item);
            }
        });
    });

    app.get('/products', (req, res) => {
        db.collection('products').find().toArray((err, item) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(item);
            }
        });
    });

    app.post('/products', (req, res) => {
        const note = {name: req.body.name, price: req.body.price, done: req.body.done};
        db.collection('products').insertOne(note, (err, result) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(result.ops[0]);
            }
        });
    });

    app.delete('/products/:id', (req, res) => {
        const id = req.params.id;
        const details = {'_id': new ObjectID(id)};
        db.collection('products').removeOne(details, (err, item) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send('Note ' + id + ' deleted!');
            }
        });
    });

    app.put('/products/:id', (req, res) => {
        const id = req.params.id;
        const details = {'_id': new ObjectID(id)};
        const note = {name: req.body.name, price: req.body.price, done: req.body.done};
        db.collection('products').updateOne(details, note, (err, result) => {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(note);
            }
        });
    });
};
