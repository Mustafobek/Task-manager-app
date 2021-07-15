const { Router } = require('express')
const router = Router()
const Task = require('../models/Task')
const auth = require('../middleware/auth')


router.get('/tasks', auth, async (req, res) => {
    // filtering
    const match = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    //pagination - skip limit

    // sorting - createdAt:desc
    const sort = {}

    if (req.query.sortBy) {
        const sortQueryParts = req.query.sortBy.split(':')
        sort[sortQueryParts[0]] = sortQueryParts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


router.post('/tasks', auth, async (req, res) => {
    try {
        const task = await new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(500).send()
    }
})


router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const updateFields = ["description", "completed"]
    const isValidOperation = updates.every(update => updateFields.includes(update))

    if (!isValidOperation) {
        throw new Error("Invalid fields to update")
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(404).send()
        }

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router