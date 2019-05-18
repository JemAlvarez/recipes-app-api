const jwt = require('jsonwebtoken')
const User = require('../schemas/user')
const mongoose = require('mongoose')

const auth = async (req, res, next) => {
    try {
        // const token = req.header('Authorization').replace('Bearer ', '')
        // const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        // if (!user) {
        //     throw new Error()
        // }

        // req.token = token
        req.user = { _id: new mongoose.Types.ObjectId() }
        next()
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth