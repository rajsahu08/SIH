const mongoose = require('mongoose');

const deniedSchema = new mongoose.Schema({
    titleName: {
        type: String,
    }
});

const denied = mongoose.model('denied',deniedSchema);

module.exports = denied;