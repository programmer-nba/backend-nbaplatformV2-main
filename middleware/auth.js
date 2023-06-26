const jwt = require('jsonwebtoken');
const { TokenList } = require('../models/token.list.model');
const verifyToken = async (req, res, next)=>{
    const token = req.headers['token'];
    if(!token){
        return res.status(401).send({status: false, message: "Unauthorized"})
    }
    try{
        const decoded = jwt.verify(token, `${process.env.TOKEN_KEY}`);
        
        if(decoded){
            //check in token_list
            const check = await TokenList.findOne({mem_id:decoded._id, token: token})
            if(check){
                return next();
            }else{
                return res.status(403).send({status: false, message: "Unauthorized"})
            }
        }else{
            return res.status(403).send({status: false, message: "Unauthorized"})
        }
    }catch(err){
        return res.status(401).send({status: false, message: "Unauthorized"})
    }
}

module.exports = verifyToken;

