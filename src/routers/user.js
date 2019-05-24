const path = require('path')
const express = require('express')
const User = require('../schemas/user')
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

// * create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const profBuffer = await sharp(path.join(__dirname, '../imgs/user-placeholder.png')).resize({ height: 250 }).png().toBuffer()
        const bannerBuffer = await sharp(path.join(__dirname, '../imgs/banner-placeholder.jpeg')).resize({ height: 250 }).png().toBuffer()
        user.profileImg = profBuffer
        user.bannerImg = bannerBuffer
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// * login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email || req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// * Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

// * Logout (all)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// * Upload profile img
router.post('/users/me/profileImg', auth, upload.single('profileImg'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250 }).png().toBuffer()
    req.user.profileImg = buffer
    await req.user.save()
    res.send()
}, (e, req, res, next) => {
    res.status(400).send({ error: e.message })
})

// * Upload banner img
router.post('/users/me/bannerImg', auth, upload.single('bannerImg'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ height: 250 }).png().toBuffer()
    req.user.bannerImg = buffer
    await req.user.save()
    res.send()
}, (e, req, res, next) => {
    res.status(400).send({ error: e.message })
})


// ? GET

// * Get user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// * Get profile img 
router.get('/users/:id/profileImg', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        res.set('Content-Type', 'image/png')
        res.send(user.profileImg)
    } catch (e) {
        res.status(404).send()
    }
})

// * Get banner img 
router.get('/users/:id/bannerImg', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        res.set('Content-Type', 'image/png')
        res.send(user.bannerImg)
    } catch (e) {
        res.status(404).send()
    }
})

// ? PATCH

// * Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password', 'bio']
    const isValid = updates.every(update => allowedUpdates.includes(update))

    if (!isValid) {
        res.status(400).send({ error: 'Invalid updates.' })
    }

    try {
        const user = req.user

        updates.forEach(update => user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// ? DELETE

// * Delete user 
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {

    }
})

// * Delete user avatar
router.delete('/users/me/profileImg', auth, async (req, res) => {
    const profBuffer = await sharp(path.join(__dirname, '../imgs/user-placeholder.png')).resize({ height: 250 }).png().toBuffer()
    req.user.profileImg = profBuffer
    await req.user.save()
    res.send()
})

// * Delete user banner
router.delete('/users/me/bannerImg', auth, async (req, res) => {
    const bannerBuffer = await sharp(path.join(__dirname, '../imgs/banner-placeholder.jpeg')).resize({ height: 250 }).png().toBuffer()
    req.user.bannerImg = bannerBuffer
    await req.user.save()
    res.send()
})


module.exports = router