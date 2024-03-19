const express = require('express')
const port = 8080


const app = express()


app.get('/', (req, res) => {
    res
        .status(200)
        .send('Nice to have you')
})



app.listen(port, () => {
    console.log('server running on port : ' + port)
})