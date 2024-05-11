const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required']
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    photo:String,
    password:{
        type:String,
        required:[true,'please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //This only work on create and  save 
            validator: function(el) {
                return el===this.password;
            },
            message:"Passwords are not the same!"
        }
    }
})

userSchema.pre("save",async function(next){
    //only run this function if password was actually modifeied
    if(!this.isModified('password')) return next();
    //hash the password at the code of 12
    this.password=await bcrypt.hash(this.password,12)

    //delete the password confirm field
    this.passwordConfirm=undefined;
    next()
})

//instance method
userSchema.methods.correctPassword=async function(candiatePassword,userPassword){
    return await bcrypt.compare(candiatePassword,userPassword)
}



const User=mongoose.model('User',userSchema)
module.exports=User
