const bcrypt = require('bcrypt');
const saltRounds = 10;
let ObjectID = require('mongodb').ObjectID;

module.exports = {
    getAllTasks, getTaskById, addTask, deleteTaskById, updateTaskById, getAllTaskFields, addTaskField, getAllUsers, signUp, logIn
};

function getAllTasks(res, db) {
    db.collection('taskMan').find().toArray((err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(item);
        }
    });
}

function getTaskById(req, res, db) {
    const id = req.params.id;
    const details = {'_id': new ObjectID(id)};
    db.collection('taskMan').findOne(details, (err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(item);
        }
    });
}

function addTask(req, res, db) {
    let createdDate = new Date();
    const note = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status || "open",
        creator: req.body.creator,
        createdDate: createdDate
    };
    db.collection('taskMan').insertOne(note, (err, result) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(result.ops[0]);
        }
    });
}

function deleteTaskById(req, res, db) {
    const id = req.params.id;
    const details = {'_id': new ObjectID(id)};
    db.collection('taskMan').removeOne(details, (err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send({'message': `Note ${id} deleted!`});
        }
    });
}

function updateTaskById(req, res, db) {
    const id = req.params.id;
    const details = {'_id': new ObjectID(id)};
    const note = {$set: req.body};
    db.collection('taskMan').updateOne(details, note, (err, result) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(note);
        }
    });
}

/* ---------------------- Task Man Fields ---------------------- */

function getAllTaskFields(res, db) {
    db.collection('taskManFields').find().toArray((err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(item);
        }
    });
}

function addTaskField(req, res, db) {
    const note = {title: req.body.title, name: req.body.name};
    db.collection('taskManFields').insertOne(note, (err, result) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(result.ops[0]);
        }
    });
}

/* ---------------------- Task Man Users ---------------------- */

function getAllUsers(res, db) {
    db.collection('taskManUsers').find().toArray((err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            let users = item.map(x => x.login);
            res.send(item);
        }
    });
}

function signUp(req, res, db) {
    db.collection('taskManUsers').find({login: req.body.login}, {login: 1}).toArray((err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else if (item) {
            res.send({'error': `User with login ${req.body.login} is already exist`});
        } else {
            let hash = bcrypt.hashSync(req.body.password, saltRounds);
            const note = {login: req.body.login, hash: hash};
            db.collection('taskManUsers').insertOne(note, (err, result) => {
                if (err) {
                    res.send({'error': 'An error has occurred'});
                } else {
                    res.send(result.ops[0]);
                }
            });
        }
    });
}

function logIn(req, res, db) {
    const note = {login: req.body.login, password: req.body.password};
    const details = {'login': req.body.login};
    db.collection('taskManUsers').findOne(details, (err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else if (!item || !bcrypt.compareSync(req.body.password, item.hash)) {
            res.send({'error': 'User or Password is incorrect!'});
        } else {
            res.send(item);
        }
    });
}
