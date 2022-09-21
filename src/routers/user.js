const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth.js')


//SETTING UP ROUTER
const router = new express.Router()


//---------------------- RESOURCE CREATION ENDPOINTS FOR USER REST API ------------------------------

//CREATING NEW USER
router.post('/users', async (req, res)=>{
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
    
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((err)=>{
    //     res.status(400).send(err)
    // })

    // res.send('testing')
})


//LOGIN USER
router.post('/users/login', async (req, res)=>{
    
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        //SENDING ONLY LIMITED DATA BACK TO CLIENT. THIS IS DEFINED IN USER MODEL IN .toJSON METHOD
        res.send({user, token})
    } 
    catch (error) {
        res.status(400).send()
    }
})


//LOGOUT FROM CURRENT SESSION
router.post('/users/logout', auth, async (req, res)=>{
    
    try {
        //saved user object in middleware function. No need to get user from database again.
        req.user.tokens = req.user.tokens.filter((x)=>{
            return x.token !== req.token //removing token
        })
        await req.user.save() //saving current user info on database

        res.send()
    } 
    catch (e) {
        res.status(500).send()
    }
})


//LOGOUT FROM ALL SESSIONS
router.post('/users/logoutAll', auth, async (req, res)=>{
    
    try {
        //saved user object in middleware function. No need to get user from database again.
        req.user.tokens = []
        await req.user.save() //saving current user info on database

        res.send()
    } 
    catch (e) {
        res.status(500).send()
    }
})


//GET ALL USERS DATA
router.get('/users', auth, async (req, res)=>{

    //GETTING ALL USERS
    try {
        const result = await User.find({})
        res.send(result)
    } catch (error) {
        res.status(500).send()
    }

    // User.find({}).then((result)=>{
    //     res.send(result)
    // }).catch((err)=>{
    //     res.status(500).send()
    // })
})


//GET CURRENT USER DATA
router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user)
})


//GET A SPECIFIC USER DATA FROM ID
// router.get('/users/:id', async (req, res)=>{
//     const _id = req.params.id
    
//     try {
//         const result = await User.findById(_id)
//         if(!result) {
//             return res.status(404).send()
//         }
//         res.send(result)
//     } catch (error) {
//         res.status(500).send()
//     }
    
    
//     // User.findById(_id).then((result)=>{
//     //     if(!result) {
//     //         return res.status(404).send()
//     //     }

//     //     res.send(result)
//     // }).catch((err)=>{
//     //     res.status(500).send()
//     // })
// })


//UPDATE SPECIFIC USER FROM ID
// router.patch('/users/:id', async (req, res)=>{
//     const _id = req.params.id
    
//     //FINDING OUT IF DATA THAT WE ARE GETTING IN REQUEST IS MATCHED WITH THE FIELDS IN THE DATABASE SO THAT IT CAN BE UPDATED
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const updates = Object.keys(req.body)
//     const isValid = updates.every((x)=>{
//         return allowedUpdates.includes(x)
//     })

//     if(!isValid)
//     {
//         return res.status(400).send('Inavlid data passed.')
//     }



//     try {
//         //THIS LINE BYPASSES THE MONGOOSE MIDDLEWARE FUNCTIONALITY SO WE NEED TO CHANGE IT A LITTLE BIT. WE HAVE TO DO IT IN A MORE TRADITIONAL WAY SO THAT OUR MONGOOSE RUNS CORRECTLY
//         // const result = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators : true})

//         //NEW METHOD FOR UPDATE SO THAT MIDDLEWARE RUNS PROPERLY WITH IT
//         const user = await User.findById(_id)
//         updates.forEach((x)=>{
//             user[x] = req.body[x]
//         })
//         await user.save()

//         if(!result){
//             return res.status(400).send()
//         }

//         res.send(result)
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })


//UPDATE CURRENT USER
router.patch('/users/me', auth, async (req, res)=>{
    
    //FINDING OUT IF DATA THAT WE ARE GETTING IN REQUEST IS MATCHED WITH THE FIELDS IN THE DATABASE SO THAT IT CAN BE UPDATED
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const updates = Object.keys(req.body)
    const isValid = updates.every((x)=>{
        return allowedUpdates.includes(x)
    })

    if(!isValid)
    {
        return res.status(400).send('Inavlid data passed.')
    }



    try {
        //THIS LINE BYPASSES THE MONGOOSE MIDDLEWARE FUNCTIONALITY SO WE NEED TO CHANGE IT A LITTLE BIT. WE HAVE TO DO IT IN A MORE TRADITIONAL WAY SO THAT OUR MONGOOSE RUNS CORRECTLY
        // const result = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators : true})

        //NEW METHOD FOR UPDATE SO THAT MIDDLEWARE RUNS PROPERLY WITH IT
        const user = req.user
        updates.forEach((x)=>{
            user[x] = req.body[x]
        })
        await user.save()

        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})


//DELETE CURRENT USER
//WE ALSO DEFINED A MIDDLEWARE FOR DELETING ALL THE TASKS CREATED BY CURRENT USER WHO IS GOING TO BE DELETED
router.delete('/users/me', auth, async (req, res)=>{
    try {
        // const result = await User.findByIdAndDelete(_id)
        // if(!result)
        // {
        //     return res.status(404).send()
        // }

        await req.user.remove() //req.user is coming from middleware

        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})


//DELETE SPECIFIC USER FROM ID
// router.delete('/users/:id', auth, async (req, res)=>{
//     const _id = req.params.id

//     try {
//         const result = await User.findByIdAndDelete(_id)
//         if(!result)
//         {
//             return res.status(404).send()
//         }

//         res.send(result)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })



//UPLOADING FILES WITH 'multer'
const upload = multer({
    // dest:'avatars', //FOR LOCAL DIRECTORY
    limits:{
        fileSize:5000000
    },
    fileFilter(req, file, cb){

        //FOR FILES CHECKING
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'))
        }
        cb(undefined, true)
        
    }
})

router.post('/users/me/avatar', auth, upload.single('avatarFile'), async (req, res)=>{
    // req.user.avatar = req.file.buffer
    
    //CONVERTING IMAGES TO PNG WITH 'sharp'
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    res.send('File uploaded to server successfully!')
}, (err, req, res, next)=>{
    res.status(400).send({error : err.message})
})



//DELETING AVATAR
router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


//FETCHING AVATARS AS A URL IN CHROME
//localhots:3000/users/user-id/avatar
router.get('/users/:id/avatar', async (req, res)=>{
    
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } 
    catch (error) {
        res.status(400).send()
    }
})

module.exports = router