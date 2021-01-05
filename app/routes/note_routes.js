let ObjectID = require('mongodb').ObjectID;
let querystring = require('querystring');
let request = require('request');
let products = require("./actions/products");
let insta = require("./actions/insta");
let pcFS = require("./actions/pc_fs");
let jira = require("./actions/jira");

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

    app.get('/products', (req, res) => {products.getAllProducts(res, db);});

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

    app.post('/testreq', (req, res) => {
        var form = {
            countryId: '224',
            checkNumberAvailability: 'true'
        };
        var formData = querystring.stringify(form);
        var contentLength = formData.length;
        var text = undefined;
        request({
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/json'
            },
            uri: 'http://gci03-p01-ags05.lab.nordigy.ru/mobile/api/proxy.html?cmd=numbers.getStatesWithNumbers',
            body: formData,
            method: 'POST'
        }, function (err, result, body) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                res.send(body);
            }
        });
    });

    app.post('/pcfs/:pcFsKey/:path', (req, res) => {
        pcFS.getDirsInDir(req, res);
    });

    app.post('/validateKey/:pcFsKey', (req, res) => {
        pcFS.validateKey(req, res);
    });

    app.get('/getDiskList', (req, res) => {
        pcFS.getDiskList(res);
    });

    app.post('/updateFile/:pcFsKey/:path/:oldValue/:newValue', (req, res) => {
        pcFS.updateFile(req, res);
    });

    app.post('/createFile/:pcFsKey/:path/:content', (req, res) => {
        pcFS.createFile(req, res);
    });

    app.post('/addToFile/:pcFsKey/:path/:content', (req, res) => {
        pcFS.addToFile(req, res);
    });

    app.post('/updateTestDataJSON/:pcFsKey/:name', (req, res) => {
        pcFS.updateTestDataJSON(req, res);
    });

    app.post('/formatTestDataJSON/:pcFsKey/:name', (req, res) => {
        pcFS.formatTestDataJSON(req, res);
    });

    app.get('/instaComp', (req, res) => {
        insta.getAllNotSuberSube(res);
    });

    app.get('/jiraTest', (req, res) => {
        jira.jiraTest(req, res);
    });
};
