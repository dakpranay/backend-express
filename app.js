const express = require('express')
const morgan = require('morgan')


const app = express()
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')

//middlewares
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

app.use(express.json())


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/user', userRouter)

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`no route found ${req.originalUrl
    // }`
    // })
    const err=new Error(`no route found ${req.originalUrl}`)
    err.statusCode=404
    err.status='fail'
    next(err)
})

app.use((err,req,res,next)=>{
    err.statusCode=err.statusCode || 500
    err.status=err.status || 'error'

    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
})



module.exports=app