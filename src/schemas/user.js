const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Recipe = require('./recipe')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        uppercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Password cannot include the word "password"')
            }
        }
    },
    bio: {
        type: String,
        default: ''
    },
    profileImg: {
        type: Buffer
    },
    bannerImg: {
        type: Buffer
    },
    tokens: {
        type: [{
            token: {
                type: String,
                required: true
            }
        }]
    },
}, {
        timestamps: true
    })

userSchema.virtual('recipes', {
    ref: 'Recipe',
    localField: '_id',
    foreignField: 'owner'
})

// ** Generate authentication token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// ** Find user by email and passowrd
userSchema.statics.findByCredentials = async (emailOrUsername, password) => {
    let user = ''
    if (!validator.isEmail(emailOrUsername)) {
        user = await User.findOne({ username: emailOrUsername })
    } else {
        user = await User.findOne({ email: emailOrUsername })
    }

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// ** Hash plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// ** Delete user recipes when user is removed
userSchema.pre('remove', async function (next) {
    const user = this

    await Recipe.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User