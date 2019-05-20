const path = require('path')
const express = require('express')
const Recipe = require('../schemas/recipe')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()

// img upload
const upload = multer({
    limits: {
        fileSize: 20000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Upload an image file under 20MB.'))
        }

        cb(undefined, true)
    }
})

// ? POST

// * create recipe
router.post('/recipes', auth, async (req, res) => {
    const recipe = new Recipe({
        ...req.body,
        owner: req.user._id
    })

    try {
        const buffer = await sharp(path.join(__dirname, '../imgs/food-placeholder.png')).resize({ height: 250 }).png().toBuffer()
        recipe.image = buffer
        await recipe.save()
        res.status(201).send(recipe)
    } catch (e) {
        res.status(400).send(e)
    }
})

// ! CHANGE (NOT FINISHED)
// * Get recipe img
router.get('/recipes/:id/img', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)

        res.set('Content-Type', 'image/png')
        res.send(recipe.image)
    } catch (e) {

    }
})

module.exports = router