const mongoose = require('mongoose');

const HopSchema = mongoose.Schema({

name : String, 
year : Number, 
origin : String, 
comment : String, 
alpha : Number, 
oil : Number, 
beta : Number, 
cohomulone : Number, 
myrecene : Number, 
farnesene : Number, 
humulene : Number, 
caryophyllene : Number 
},
{
    timestamps: true
});

module.exports = mongoose.model('Hop', HopSchema);