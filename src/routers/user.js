const { Router } = require('express')
const router = Router()
const User = require('../models/User')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendByeEmail, sendWelcomeEmail} = require('../emails/nodemailer')

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.post('/users', async (req, res) => {
    try {
        const user = await new User(req.body)
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        console.log(req.user)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e.message)
    }
})


router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send(e.message)
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const updatingFields = ["email", "password", "name", "age"]
    const isValidOperation = updates.every(update => updatingFields.includes(update))

    if (!isValidOperation) {
        res.status(400).send({error: "Invalid update fields"})
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])

        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendByeEmail(req.user.email, req.user.name)

        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

// USER AVATAR


// multer setup
const multer = require('multer')
const avatarPic = multer({
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('File does not match with image type!'), false)
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, avatarPic.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({width: 300, height: 300}).png().toBuffer()

        req.user.avatar = buffer
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = ''
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('There is no user or user-image!')
        }

        // res.send(user.avatar)
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(500).send()
    }
})




module.exports = router