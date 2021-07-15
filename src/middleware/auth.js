const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoder = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoder._id, 'tokens.token': token})

        if (!user) {
            throw new Error("No user found")
        }

        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(500).send(e.message)
    }
}

module.exports = auth