const dotenv=require('dotenv')
dotenv.config({path:'./config.env'})

const app=require('./app')
//we can set enviornmental variable using terminal by writting 
//NODE_ENV=development x=20 nodemon server.js

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('server running on port : ' + port)
})