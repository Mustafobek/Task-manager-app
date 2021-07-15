const mongoose = require('mongoose')

mongoose
    .connect(process.env.MONGO_LOCAL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
})
    .then(() => console.log(`MongoDB is running ok!`))
    .catch(e => console.log(e))