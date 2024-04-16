module.exports=(err,req,res,next)=>{
    // console.log(err.stack) to see the error stack and where the error is occured
    err.statusCode=err.statusCode || 500
    err.status=err.status || 'error'

    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
}