const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
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
        // add default before save if not specified
    },
    // tokens: {
    //     type: [{
    //         token: {
    //             type: String,
    //             required: true
    //         }
    //     }]
    // },
}, {
        timestamps: true
    })

// userSchema.virtual('recipes', {
//     ref: 'Recipes',
//     localField: '_id',
//     foreignField: 'owner'
// })

const User = mongoose.model('User', userSchema)

module.exports = User