const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks',auth,async({body,user},res)=>{
    try {
        const task = new Task({
            ...body,
            owner: user._id
        })
        const saved = await task.save()
        res.status(201).send(saved)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks',auth,async({user,query},res)=>{
    const match ={}
    if(query.completed){
        match.completed = query.completed==='true'
    }
    const sort = {}
    if(query.sortBy){
        const parts = query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'?-1:1
    }
    try {
        await user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(query.limit),
                skip: parseInt(query.skip),
                sort
            }
        }).execPopulate()
        res.send(user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/tasks/:id',auth,async ({params,user},res)=>{
    try {
        await user.populate({
            path:'tasks',
            match:{
                _id:params.id
            }
        }).execPopulate()
        const docs = user.tasks[0]
        if(!docs){
            return res.status(404).send()
        }
        res.send(docs)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.patch('/tasks/:id',auth,async({body,params,user},res)=>{
    try {
        await user.populate({
            path: 'tasks',
            match: {
                _id:params.id
            }
        }).execPopulate()
        const task = user.tasks[0]
        if(!task){
            return res.status(404).send()
        }
        for(key of Object.keys(body)){
            if(!Object.keys(Task.schema.obj).includes(key)){
                throw new Error('Invalid data supplied')
            }
            task[key] = body[key]
        }
        const updatedTask = await task.save()
        res.send(updatedTask)
    }catch (error) {
        res.status(400).send(error.message)
    }
})
router.delete('/tasks/:id',auth,async ({params,user},res)=>{
    try {
        await user.populate({
            path: 'tasks',
            match: {
                _id:params.id
            }
        }).execPopulate()
        const toDelete = user.tasks[0]
        if(!toDelete){
            return res.status(404).send()
        }
        await Task.deleteOne(toDelete)
        res.send(toDelete)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router