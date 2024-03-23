const express = require('express')
const morgan = require('morgan')


const app = express()
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')


//middlewares
app.use(morgan('dev'))
app.use(express.json())
// app.use(express.static(`${__dirname}/dev-data/templates`)) //to serve static file


app.use((req, res, next) => {
    console.log("hello from middleware")
    next()
})


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/user', userRouter)


module.exports=app