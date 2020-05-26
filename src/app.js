const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

require('./db/mongoose')
const UserRouter = require('./routers/userRoutes')
const TaskRouter = require('./routers/taskRoutes')


app.use(UserRouter)
app.use(TaskRouter)
app.use(express.json())


app.listen(process.env.PORT,()=>{
    console.log('server started')
})


