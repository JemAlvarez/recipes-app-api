const express = require('express')
const Recipe = require('../schemas/recipe')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/recipes', auth, async (req, res) => {
    const recipe = new Recipe({
        ...req.body,
        owner: req.user._id
    })

    try {
        await recipe.save()
        res.status(201).send(recipe)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router