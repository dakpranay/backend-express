const express = require('express')
const morgan = require('morgan')
const rateLimit=require('express-rate-limit')

const AppError =require('./utils/appError')
const globleErrorHandler=require('./controller/errorController')
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')

const app = express()
// globel middlewares
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many request from this ip please try again in an hour!'
})
app.use('/api',limiter)

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    next()
})


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/user', userRouter)

app.all('*',(req,res,next)=>{
   
    // const err=new Error(`no route found ${req.originalUrl}`)
    // err.statusCode=404
    // err.status='fail'
    next(new AppError(`no route found ${req.originalUrl}`,404))
})

app.use(globleErrorHandler)

module.exports=app