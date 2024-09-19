const mongoose = require('mongoose');
const initData = require('./data.js');
const db = require('../models/db.js');

const MONGO_URL = 'mongodb://localhost:27017/SIH';

app.use(express.static('public'));  // Serve static files from the 'public' directory

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        await db.insertMany(initData.data);
        console.log('Data successfully inserted');
    } catch (err) {
        console.error('Error inserting data:', err);
    } finally {
        mongoose.connection.close(); // Ensure connection is closed after operation
    }
}

initDB();

// const finding = async ()=>{
//     try{
//         const result = await db.find({}, 'titleName');
//         console.log(result);
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// finding();