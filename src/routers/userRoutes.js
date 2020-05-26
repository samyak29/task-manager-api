const express = require('express')
const multer = require('multer')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendCancelEmail,sendWelcomeEmail} = require('../emails/account')

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
}) 
router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((tokenObj)=>tokenObj.token!=req.token)
        await req.user.save()
        res.send('Logged out')
    } catch (e) {
        res.status(500).send(error.message)
    }
})
router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out of all sessions')
    } catch (error) {
        res.status(500).send()
    }
    
})
router.post('/users',async({body},res)=>{
    try {
        const user = new User(body)
        const token = await user.generateAuthToken()
        const saved = await user.save()
        res.status(201).send({saved,token})
        sendWelcomeEmail(user.email, user.name)
    } catch (error) {
        res.status(400).send(error.message)
    }
})
router.patch('/users/me',auth,async({body,user},res)=>{
    try {
        for(key of Object.keys(body)){
            if(Object.keys(User.schema.obj).includes(key)){
                user[key] = body[key]
            }else{
                throw new Error('Invalid data supplied')
            }
        }
        const updatedUser = await user.save()
        res.send(updatedUser)
    } catch (error) {
        res.status(400).send(error.message)
    }
})
router.delete('/users/me',auth,async ({user},res)=>{
    try {
        await user.remove()
        sendCancelEmail(user.email,user.name)
        res.send(user)

    } catch (error) {
        res.status(500).send(error.message)
    }
})
router.post('/users/login',async ({body:{email,password}},res)=>{
    try {
        const user = await User.findByCredentials(email,password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please provide jpeg/jpg/png file'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async ({user,file},res)=>{
    user.avatar = await sharp(file.buffer).resize({width:250,height:250}).png().toBuffer()
    await user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
router.delete('/users/me/avatar',auth,async ({user},res)=>{
    try {
        user.avatar = undefined
        await user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
    
})
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user||!user.avatar){
            throw new Error()
        }
        res.set("Content-Type","image/png")
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
    
})

module.exports = router