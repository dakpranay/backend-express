const crypto=require('crypto')
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
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
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
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date
})

//middleware
userSchema.pre("save",async function(next){
    //only run this function if password was actually modifeied
    if(!this.isModified('password')) return next();
    //hash the password at the code of 12
    this.password=await bcrypt.hash(this.password,12)

    //delete the password confirm field
    this.passwordConfirm=undefined;
    next()
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt=Date.now()-1000;
    next()
})

//instance method
userSchema.methods.correctPassword=async function(candiatePassword,userPassword){
    return await bcrypt.compare(candiatePassword,userPassword)
}

userSchema.methods.changePasswordAfter=function(JWTTIMESTAMP){
    if(this.passwordChangedAt){
        const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
        return JWTTIMESTAMP<changedTimeStamp
    }
    return false;
}

//need crypto module for this
userSchema.methods.createPasswordResetToken =function(){
    const resetToken=crypto.randomBytes(32).toString('hex')
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetExpires=Date.now()+10*60*1000;
    return resetToken;
}



const User=mongoose.model('User',userSchema)
module.exports=User
