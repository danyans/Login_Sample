var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// WolfApply
var WolfApply = new Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },
    
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports  = mongoose.model('WolfApply', WolfApply);