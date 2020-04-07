const mongoose = require('mongoose');

const { Schema } = mongoose;

const ItemSchema = new Schema({
    _id: String,
    name: String,    
    description: String,
    user_id: String,
    created_at: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;