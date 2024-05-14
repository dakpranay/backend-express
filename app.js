const express = require('express')
const morgan = require('morgan')
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')

const AppError =require('./utils/appError')
const globleErrorHandler=require('./controller/errorController')
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')

const app = express()
// globel middlewares
// set security http headers
app.use(helmet())

//developemnt logging 
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

//limit request from api
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many request from this ip please try again in an hour!'
})
app.use('/api',limiter)

//body parser,reading data from body into req.body
app.use(express.json({limit:'10kb'}))

//serving static files
app.use(express.static(`${__dirname}/public`))

//Test middleware
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