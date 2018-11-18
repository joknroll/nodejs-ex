const mongoose = require('mongoose');

const MaltSchema = mongoose.Schema({
    name : String, 
    yield: Number
},
{
    timestamps: true,
    collection : 'malts'
});

module.exports = mongoose.model('Malt', MaltSchema);