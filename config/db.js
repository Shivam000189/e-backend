
require('dotenv').config();
const mongoose = require('mongoose');



const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB);
        console.log('MongoDB Connected');
    }catch(error){
        console.error('X MongoDB connection error : ', error.massage);
        process.exit(1);
    }
}

module.exports = connectDB;

