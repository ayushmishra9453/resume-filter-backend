const getAccess=async(req,res,next)=>{
    res.status(200).json({message:"success",status:true})
}

module.exports=getAccess;