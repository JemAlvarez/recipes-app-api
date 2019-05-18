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

module.exports = app