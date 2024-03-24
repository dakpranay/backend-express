const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const app = require('./app')
//we can set enviornmental variable using terminal by writting 
//NODE_ENV=development x=20 nodemon server.js

const port = process.env.PORT || 8080

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)


mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((con)=>{
    console.log('database connected successfully')
}).catch(err=>{
    console.log(err)
})



app.listen(port, () => {
    console.log('server running on port : ' + port)
})
