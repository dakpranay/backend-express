const path=require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const cookieParser=require('cookie-parser')
const cors=require('cors')

const AppError =require('./utils/appError')
const globleErrorHandler=require('./controller/errorController')
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')
const reviewRouter=require('./routes/reviewRoutes')
const viewRouter=require('./routes/viewRoutes')

const corsOptions = {
    origin: 'http://localhost:8080', // Your frontend origin
    credentials: true, // Allow credentials (cookies)
};
const app = express()
app.use(cors(corsOptions))


app.set('view engine','pug')
app.set('views',path.join(__dirname,'views'))

// globel middlewares
//serving static files
 app.use(express.static(path.join(__dirname,'public')))

 // set security http headers
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://127.0.0.1:8080/api/v1/user/login","http://127.0.0.1:8080/api/v1/user/logout","http://127.0.0.1:8080/api/v1/user/updateMe","http://127.0.0.1:8080/api/v1/user/updateMyPassword"], // Add WebSocket server address
        scriptSrc: ["'self'", "js/axios.min.js"], // Allow scripts from your local scripts folder
    },
}))


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
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())

//Data sanitization against NOsql Query Injection
app.use(mongoSanitize())

//Data sanitization against xss
app.use(xss())

//prevent parameter pollution
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}))


//Test middleware
app.use((req,res,next)=>{
    // console.log(req)
    req.requestTime=new Date().toISOString();
    // console.log(req.cookies)
    // console.log(req.headers)
    next()
})

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/reviews',reviewRouter)


app.all('*',(req,res,next)=>{
   
    // const err=new Error(`no route found ${req.originalUrl}`)
    // err.statusCode=404
    // err.status='fail'
    next(new AppError(`no route found ${req.originalUrl}`,404))
})

app.use(globleErrorHandler)

module.exports=app