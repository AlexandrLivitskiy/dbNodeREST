module.exports = {
    getAllProducts
};

function getAllProducts(res, db) {
    db.collection('products').find().toArray((err, item) => {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            res.send(item);
        }
    });
}
