const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');




const app = express();
PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
app.use(cors());

app.get('/', (req, res) => {
    res.send("Backend API is running..... ");
});

connectDB();

app.listen(PORT , () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})




