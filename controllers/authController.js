const User = require('../models/user');
const bcrypt = require('bcryptjs');


exports.register = async (req, res) => {
    const {name , email, password, role} = req.body;
    const userExist = await User.findOne({email});

    if(!name || !email || !password || !role || userExist ) {
        return res.status(400).json({msg:"all the fields are required"});
    }

    const passwordHased = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password:passwordHased,
        role
    });


    return res.status(201).json({
        message:"User Create Succesfully",
        userId : user._id
    });
};