const mongoose = require('mongoose');

const connect = (ee) => {
    ee.once('boot.ready', () => {
        mongoose.connect(process.env.MONGODB_CONNECTION_URI, {
            useNewUrlParser: true
        }).then((db) => {            
            ee.emit('db.ready', db)
        }).catch(err => {
            ee.emit('db.error', err)
        })
    })
}

module.exports = { connect }