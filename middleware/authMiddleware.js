const jwt = require('jsonwebtoken');


const authMiddleware = async (req, res, next)=> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];


    if(!token) return res.status(401).json({msg:"Access Denied, No token provided"});


    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(403).json({ msg: "Invalid or expired token" });
    }
}


module.exports = authMiddleware;