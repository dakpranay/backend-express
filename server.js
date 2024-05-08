const mongoose = require('mongoose')

const dotenv = require('dotenv')

process.on('uncaughtException',err=>{
    console.log(err.name,err.message)
    console.log('uncaught Exception shutting down')
    process.exit(1)
})

dotenv.config({ path: './config.env' })

const app = require('./app')


const port = process.env.PORT || 8080

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((con)=>{
    console.log('database connected successfully')
})


const server=app.listen(port, () => {
    console.log('server running on port : ' + port)
})

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message)
    console.log('unhandled rejection shutting down')
    server.close(()=>{
        process.exit(1)
    })
})