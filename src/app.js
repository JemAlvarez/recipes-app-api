const express = require('express')
require('./db/mongoose')
const cors = require('cors')
const userRouter = require('./routers/user')
const recipeRouter = require('./routers/recipe')

const app = express()
app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(recipeRouter)

app.get('/', (req, res) => {
    res.send({
        project: 'https://github.com/JemAlvarez/recipes-app-api'
    })
})

module.exports = app