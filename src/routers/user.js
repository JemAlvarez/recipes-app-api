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


// ! CHANGE (NOT FINISHED)
// * Get profile img 
router.get('/users/avatar', async (req, res) => {
    try {
        const user = await User.findById("5ce162584a86f43a64d5fd68")

        res.set('Content-Type', 'image/png')
        res.send(user.bannerImg)
    } catch (e) {

    }
})


module.exports = router