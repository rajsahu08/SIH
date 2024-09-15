const mongoose = require('mongoose');
const initData = require('./data.js');
const db = require('../models/db.js');

const MONGO_URL = 'mongodb+srv://rajsahu0702:4uRqIykvud1vdX5e@db.fjvcb.mongodb.net/';

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