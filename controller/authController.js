const crypto=require('crypto')
const {promisify} =require('util')
const jwt=require('jsonwebtoken')
const User=require('../models/userModel')
const catchAsync =require('../utils/catchAsync')
const AppError=require('../utils/appError')
const sendEmail=require('../utils/email')

const signToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const createSendToken=(user,statusCode,res)=>{
    const token =signToken(user._id);
    
    const cookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true,
        sameSite: 'None', // Ensure cross-origin cookies are accepted
    }

    if(process.env.NODE_ENV==='production') cookieOptions.secure=true

    res.cookie('jwt',token,cookieOptions)

    //remove the password from the response
    user.password=undefined
    
    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user
        }
    })
}


exports.signup=catchAsync(async(req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });

    createSendToken(newUser,201,res)

})

exports.login=catchAsync(async (req,res,next)=>{
    const {email,password}=req.body;

    //check if email and password is exists
    if(!email || !password){
        return next(new AppError('Please provide a email and password',400))
    }

    //check if user is exists and password is correct
    const user =await User.findOne({email}).select('+password')
    if(!user || !await user.correctPassword(password,user.password)){
        return next(new AppError('Incorect email and password',401))
    }

    // console.log(res,"res")
    //everything is correct send the response
    createSendToken(user,200,res)
})

exports.logout=(req,res)=>{
    res.cookie('jwt','logged-out',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({status:"success"})
}


exports.protect=catchAsync(async(req,res,next)=>{
    //getting token and check of its there
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token=req.cookies.jwt
    }
   
    if(!token){
        return next(new AppError('You are not logged in! Please login',401))
    }

    //verify the token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    //check if user still exists
    const currentUser=await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('User no loger exists',401))
    }

    //check user changed his password after the token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! please login in again',401))
    }

    //grant access to protect route
    req.user=currentUser;
    next()
})


//only for render pages no error
exports.isLoggedIn=(async(req,res,next)=>{

    if(req.cookies.jwt){
    try{
    const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

    //check if user still exists
    const currentUser=await User.findById(decoded.id)
    if(!currentUser){
        return next()
    }

    //check user changed his password after the token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next()
    }
    //there is logged in user
    res.locals.user=currentUser
    return next()
}catch(err){
return next()
}}
next()
})


exports.restrictTo=(...roles)=>{
return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return next(new AppError('You dont have permission to perform this action',403))
    }
    next()
}
}

exports.forgotPassword=catchAsync(async (req,res,next)=>{
    //get the user based on posted email
    const user=await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('No user with this email',404))
    }

    //generate the random reset token
    const resetToken=user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})

    //send it to users email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message=`forgot your password?submit a patch request with your new password and confirm password to : ${resetURL}.\n If you didnt forget your password,please ignore this email!`

    try{
        await sendEmail({
            email:user.email,
            subject:'Your password reset token (valid only for 10 min)',
            message
        })

        res.status(200).json({
            status:"success",
            message:"token sent to email!"
        })
    }catch(err){
        user.passwordResetToken=undefined
        user.passwordResetExpires=undefined
        await user.save({validateBeforeSave:false})
        return next(new AppError('There was an error in sending the email.Try again later!',500))
    }
})

exports.resetPasword=catchAsync(async(req,res,next)=>{
    //get user based on token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user=await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()}
    })
    //if token is not expired and user is exists then update the new password
    if(!user){
        return next(new AppError('Token is inalid or has expired',400))
    }
    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    user.passwordResetToken=undefined
    user.passwordResetExpires=undefined
    await user.save()

    //update changedPasswordAt property for the user

    //log the user in and send the jwt
    createSendToken(user,200,res)
})

exports.updatePassword=catchAsync(async(req,res,next)=>{
    //get the user from collection'
    const user =await User.findById(req.user.id).select('+password')

    //check if posted password is correct
    if(!await user.correctPassword(req.body.passwordCurrent,user.password)){
        return next(new AppError('Your password is wrong',401))
    }
    //if so update password
    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    //User.findByIdAndUpdate will not work as intended
    await user.save();

    //log user in,send jwt
    createSendToken(user,201,res) 
})