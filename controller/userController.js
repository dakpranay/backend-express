const User = require('../models/userModel')
const AppError=require('../utils/appError')
const catchAsync =require('../utils/catchAsync')
const factory=require('./handlerFactory')


const filterObj=(obj,...allowedFields)=>{
    const newObj={}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el]
    })
    return newObj
}


exports.updateMe=catchAsync(async (req,res,next)=>{
    //post error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update.Please use /updateMyPaasword',400))
    }

    //filtered unwanted data
    const filteredBody=filterObj(req.body,'name','email');


    //update user document
    const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })


    res.status(200).json({
        status:"success",
        data:{
            user:updatedUser
        }
    })

})

exports.deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})
    res.status(204).json({
        status:"success",
        data:null
    })
})

exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next()
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not yet defined"
    })
}

//do not password with this update
exports.getAllUsers = factory.getAll(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getUser = factory.getOne(User)