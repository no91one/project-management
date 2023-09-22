const jwt = require('jsonwebtoken');

const getToken = () => localStorage.getItem('jwtToken');

module.exports.generateToken = (user)=>{
    return jwt.sign({user},'Alohomora',{expiresIn : '1h'})
}
module.exports.authenticateToken = (req,res,next)=>{
    let isAuthenticated = false;
    const token = req.cookies.jwtToken;
    if(!token){
        return res.redirect('/users/signin')
    }
    jwt.verify(token,'Alohomora',(err,user)=>{
        if(err){
            console.log(err);
        }
        req.user = user;
        next();
    })
}
