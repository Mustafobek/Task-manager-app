const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const Task = require("./Task");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: (value) => {
            if (!validator.isEmail(value)) {
                throw new Error('Email was provided wrongly')
            }
        }
    },
    age: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
        validate: (value) => {
            if (value.length < 4) {
                throw new Error('Password must contain more than 4 characters')
            } else if (value.includes('password')) {
                throw new Error("Password cannot contain 'password' string!")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// searching user in logging in process
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if (!user) {
        throw new Error("Unable to login - user does not exist")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Unable to login - wrong password is provided")
    }

    return user
}

// token generation
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET)
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

// hiding private date
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// pre-save encryption
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

// pre-delete removing tasks of user
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({owner: this._id})
    await this.save()

    next()
})

// virtual USER-TASK relationship
userSchema.virtual('tasks', {
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})


const User = mongoose.model('users', userSchema)

module.exports = User