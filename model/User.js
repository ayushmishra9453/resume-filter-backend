const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true 
    },
    password:{
        type:String,
        // required:true
    },
    password_otp:{
        type:{type:String},
        send_time:{type:String},
        limit:{type:Number,default:5},

    },
    contact_number:{
        type:Number
    },
    provider: {
         type: String,
          default: "local"
   }

},{timestamps:true})
module.exports=mongoose.model("User",userSchema)