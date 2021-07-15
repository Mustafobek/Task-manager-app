const express = require('express')

const app = express()
const port = process.env.PORT

// Database
require('./db/mongoose')


// Models

// Routers
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

// setups
app.use(express.json())

// Router-setups
app.use(userRouter)
app.use(taskRouter)


app.listen(port,() => console.log(`Server is on port: ${port}`))


