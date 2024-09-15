const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
    titleCode: {
        type: String,
      },
      titleName: {
        type: String,
      },
      hindiTitle: {
        type: String,
      },
      registerSerialNo: {
        type: String,
      },
      regnNo: {
        type: String,
      },
      ownerName: {
        type: String,
      },
      state: {
        type: String,
      },
      publicationCityDistrict: {
        type: String,
      },
      periodity: {
        type: String,
      }
    });
    
const db = mongoose.model('db', dbSchema);
    
module.exports = db;