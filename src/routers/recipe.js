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

// * upload recipe image
router.post('/recipes/:id/img', auth, upload.single('recipeImg'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250 }).png().toBuffer()
    const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.user._id })
    if (!recipe) {
        return res.status(404).send()
    }
    recipe.image = buffer
    await recipe.save()
    res.send()
}, (e, req, res, next) => {
    res.status(400).send({ error: e.message })
})

// ? GET

// * Get recipe
router.get('/recipes/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.user._id })

        if (!recipe) {
            return res.status(404).send()
        }

        res.send(recipe)
    } catch (e) {
        res.status(500).send()
    }
})

// * Get recipe img
router.get('/recipes/:id/img', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)

        res.set('Content-Type', 'image/png')
        res.send(recipe.image)
    } catch (e) {
        res.status(404).send()
    }
})

// * Get recipes (all)
// TODO: ?fav=true
// TODO: ?limit=10&page=2
// TODO: ?sortBy=createdAt_asc/desc
router.get('/recipes', auth, async (req, res) => {
    const match = {}
    const sort = {}
    const filter = { owner: req.user._id }

    if (req.query.fav) {
        match.fav = req.query.fav === 'true'
        filter.fav = match.fav
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    const recipesNum = await Recipe.countDocuments(filter, (err, count) => count)

    try {
        await req.user.populate({
            path: 'recipes',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: (parseInt(req.query.pageNum) - 1) * parseInt(req.query.limit),
                sort
            }
        }).execPopulate()
        res.send({
            pages: Math.ceil(recipesNum / req.query.limit),
            pageNum: parseInt(req.query.pageNum),
            recipesNum,
            recipes: req.user.recipes
        })
    } catch (e) {
        res.status(500).send()
    }
})

// ? PATCH

// * Update recipe
router.patch('/recipes/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'desc', 'fav', 'steps', 'ingredients', 'rating', 'diff']
    const isValid = updates.every(update => allowedUpdates.includes(update))

    if (!isValid) {
        res.status(400).send({ error: 'Invalid updates.' })
    }

    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.user._id })

        if (!recipe) {
            res.status(404).send()
        }

        updates.forEach(update => recipe[update] = req.body[update])
        await recipe.save()

        res.send(recipe)
    } catch (e) {
        res.status(400).send(e)
    }
})

// ? DELETE 

// * Delete recipe img
router.delete('/recipes/:id/img', auth, async (req, res) => {
    const buffer = await sharp(path.join(__dirname, '../imgs/food-placeholder.png')).resize({ height: 250 }).png().toBuffer()
    const recipe = await Recipe.findOne({ _id: req.params.id, owner: req.user._id })
    if (!recipe) {
        return res.status(404).send()
    }
    recipe.image = buffer
    await recipe.save()
    res.send()
})

// * Delete recipes (all)
router.delete('/recipes/deleteAll', auth, async (req, res) => {
    try {
        await Recipe.deleteMany({}, e => {
            if (e) return res.send(e)
        })
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// * Delete recipe 
router.delete('/recipes/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!recipe) {
            return res.status(404).send()
        }

        res.send(recipe)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router