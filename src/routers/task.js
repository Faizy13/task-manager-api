const express = require('express')
const Task = require('../models/task.js')
const auth = require('../middleware/auth')

//SETTING UP ROUTER
const router = new express.Router()

//RESOURCE READING ENDPOINTS FOR TASKS REST API

//CREATE NEW TASK
router.post('/tasks', auth, async (req, res)=>{
    // const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner : req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })
})


//RETURNING ALL TASKS
/*router.get('/tasks', async (req, res)=>{
    
    try {
        const result = await Task.find({})
        res.send(result)
    } catch (error) {
        res.status(500).send()
    }
    
    
    // Task.find({}).then((result)=>{
    //     res.send(result)
    // }).catch((err)=>{
    //     res.status(500).send()
    // })
})*/


//RETURNING TASKS WHICH ARE CREATED BY CURRENTLY LOGGED USER
/*router.get('/tasks', auth, async (req, res)=>{
    
    try {
        //METHOD 1 -FINDING TASKS IN 'tasks' COLLECTION
        const result = await Task.find({owner: req.user._id})
        res.send(result)

        //METHOD 2 - POPULATING TASKS FROM USER MODEL USING THE VIRTUAL PROPERTY 'tasks'
        // await req.user.populate('tasks').execPopulate()
        // res.send(req.user.tasks)
    } 
    catch (error) {
        res.status(500).send()
    }
})*/


//RETURNING TASKS WITH FILTERING, PAGINATION, SORTING
// /tasks?completed=true&limit=10&skip=0&createdAt:asc
router.get('/tasks', auth, async (req, res)=>{
    
    const _query = {owner: req.user._id}
    if(req.query.completed){
        _query.completed = req.query.completed === 'true'
    }
    
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    if(req.query.createdAt){
        parseInt(req.query.createdAt)
    }

    // console.log(_query)

    try {
        //METHOD 1 -FINDING TASKS IN 'tasks' COLLECTION
        const result = await Task.find(_query).skip(skip).limit(limit).sort({createdAt: req.query.createdAt})
        res.send(result)

        //METHOD 2 - POPULATING TASKS FROM USER MODEL USING THE VIRTUAL PROPERTY 'tasks'
        // await req.user.populate({
        //     path : 'tasks',
        //     match: _query,
        //     options:{
        //         limit: parseInt(req.query.limit),
        //         skip: parseInt(req.query.skip),
        //         sort:{
        //             createdAt: -1
        //         }
        //     }
        // }).execPopulate()

        // res.send(req.user.tasks)
    } 
    catch (error) {
        res.status(500).send()
    }
})


//FETCH ANY TASK BY ITS ID
/*router.get('/tasks/:id', async (req, res)=>{
    const _id = req.params.id

    try {
        const result = await Task.findById(_id)
        res.send(result)
    } catch (error) {
        res.send(500).send()
    }

    // Task.findById(_id).then((result)=>{
    //     res.send(result)
    // }).catch((err)=>{
    //     res.send(500).send()
    // })
})*/


//FETCH TASK BY ID AND IF CURRENT USER CREATED IT
router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }

        res.send(task)
    } 
    catch (error) {
        res.send(500).send()
    }
})


//UPDATING ANY TASK WITHOUT AUTHENTICATION
/*router.patch('/tasks/:id', async (req, res)=>{
    const _id = req.params.id

    //FINDING OUT IF DATA THAT WE ARE GETTING IN REQUEST IS MATCHED WITH THE FIELDS IN THE DATABASE SO THAT IT CAN BE UPDATED
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValid = updates.every((x)=>{
        return allowedUpdates.includes(x)
    })

    if(!isValid)
    {
        return res.status(400).send('Invalid data passed.')
    }


    try {
        //THIS LINE BYPASSES THE MONGOOSE MIDDLEWARE FUNCTIONALITY SO WE NEED TO CHANGE IT A LITTLE BIT. WE HAVE TO DO IT IN A MORE TRADITIONAL WAY SO THAT OUR MONGOOSE RUNS CORRECTLY
        // const result = await Task.findByIdAndUpdate(_id, req.body, {new : true, runValidators : true})
        
        //NEW METHOD FOR UPDATE SO THAT MIDDLEWARE RUNS PROPERLY WITH IT
        const task = await Task.findById(_id)
        
        updates.forEach((x)=>{
            task[x] = req.body[x]
        })

        await task.save()


        
        if(!task){
            return res.status(400).send()
        }

        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})*/


//UPDATING TASKS RELATED TO CURRENT USER
router.patch('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    //FINDING OUT IF DATA THAT WE ARE GETTING IN REQUEST IS MATCHED WITH THE FIELDS IN THE DATABASE SO THAT IT CAN BE UPDATED
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValid = updates.every((x)=>{
        return allowedUpdates.includes(x)
    })

    if(!isValid)
    {
        return res.status(400).send('Invalid data passed.')
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(400).send()
        }

        updates.forEach((x)=>{
            task[x] = req.body[x]
        })

        await task.save()
        res.send(task)
    } 
    catch (error) {
        res.status(400).send(error)
    }
})


//DELETING ANY TASK WITHOUT AUTHENTICATION
/*router.delete('/tasks/:id', async(req, res)=>{
    const _id = req.params.id

    try {
        const result = await Task.findByIdAndDelete(_id)
        if(!result){
            return res.status(404).send()
        }

        res.send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})*/


//DELETING TASK RELATED TO USER
router.delete('/tasks/:id', auth, async(req, res)=>{
    const _id = req.params.id

    try {
        const result = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!result){
            return res.status(404).send()
        }

        res.send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router