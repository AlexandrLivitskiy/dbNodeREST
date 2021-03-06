const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const config = require('./config/main_config');
const app = express();
const port = 8000;
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
MongoClient.connect(config.mongoUrl, (err, database) => {
    if (err) {
        return console.log(err);
    }
    require('./app/routes')(app, database);
    app.listen(port, () => {
        console.log('We are live on ' + port);
    });
});
