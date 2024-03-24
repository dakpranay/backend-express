const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

const app = require('./app')


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
