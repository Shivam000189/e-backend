const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');



app.use(express.json());
app.use('/auth', authRoutes);


app.get('/', (req, res)=> {
    res.send('E-backend');
})

module.exports = app;



