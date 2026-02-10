const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
exports.register = async (req, res) => {
    try{
        const {name , email, password} = req.body;
        
        if(!name || !email || !password) {
            return res.status(400).json({msg:"all the fields are required"});
        }
        const userExist = await User.findOne({email});

        if(!userExist) return res.status(400).json({msg:"user all ready exist"});

        const user = await User.create({
            name,
            email,
            password
        });


        return res.status(201).json({
            message:"User Create Succesfully",
            userId : user._id
        });
    } catch(error){
        res.status(500).json({msg:"Server Error", error:error.message});
    }
};



exports.login = async (req, res)=> {
    try{
    const {email, password} = req.body;

    if(!email || !password) return res.status(400).json({msg:"all Fields are necces"});

    const user = await User.findOne({email});
    if(!user) return res.status(401).json({msg:"Email doesn't exist"});

    isMatched = await User.matchPassword(password);
    if(!isMatched) return res.status(401).json({msg:"Email and password is wrong"});


    const token = jwt.sign(
        {userId:user._id, email:user.email},
        process.env.SECRET_KEY,
        {expiresIn:'1h'}
    );
    res.status(200).json({msg:"Login Succesfully", token});
    }catch(error){
        res.status(500).json({msg:"Server Error", error:error.message});
    }
}