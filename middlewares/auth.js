const jwt=require('jsonwebtoken')

exports.generateToken=(email)=>{
    const accessToken=jwt.sign({email:email},process.env.ACCESS_TOKEN_KEY,{
        expiresIn:'2d'
    })
    return accessToken;
}

exports.auth=(req,res,next)=>{
    try{
        const accessToken=req.cookies.accessToken;
        if(!accessToken){
            const error=new Error('unauthorized');
            error.statusCode=403
            throw error 
        }
        jwt.verify(accessToken,process.env.ACCESS_TOKEN_KEY,(error,decoded)=>{
            if(error){
                const error=new Error("unauthorized")
                error.statusCode=403;
                return next(error);
            } else{
               req.email = decoded.email;
               next()
            }
        })
    }
    catch(error){
        next(error);
    }
};