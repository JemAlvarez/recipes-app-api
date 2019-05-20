const mongoose = require('mongoose')
const validator = require('validator')

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true
    },
    image: {
        type: Buffer
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    fav: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: null
    },
    diff: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    steps: {
        type: [String],
        required: true
    }
}, {
        timestamps: true
    })

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe