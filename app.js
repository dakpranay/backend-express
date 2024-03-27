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
    res.status(404).json({
        status:'fail',
        message:`no route found ${req.originalUrl
    }`
    })
    next()
})




module.exports=app