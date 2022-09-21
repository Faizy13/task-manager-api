const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//FOR USING MIDDLEWARE FUNCTIONALITY, WE NEED TO STRUCTURE OUR MODEL USING SCHEMA
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email :{
        type : String,
        require : true,
        trim : true,
        lowercase : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Email is invalid!')
            }
        }
    },
    password : {
        type : String,
        required : true,
        minLength : 7,
        trim : true,
        validate(value){
            if(value.toLowerCase().includes('password'))
            {
                throw new Error('Enter a unique password')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value < 0)
            {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens : [{
        token:{
            type : String,
            required : true
        }
    }],
    avatar:{
        type:Buffer
    }
}, 
{
    timestamps: true
})


//VIRTUAL PROPERTY - NOT ACTUAL DATA STORED IN THE DATABASE - RELATIONSHIP BETWEEN 2 ENTITIES
// USER & TASK RELATION
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //USER ID
    foreignField: 'owner' //USER ID IN TASKS COLLECTION TO STORE WHICH USER CREATED THIS TASK
})
//SUMMARY : EVEN THOUGH WE ARE STORING NOTHING ABOUT 'tasks' IN 'users' COLLECTION, WE CAN STILL ACCESS THE 'tasks' RELATED TO THAT USER WHO
//          CREATED IT. THAT'S WHY WE DEFINE THE 'virtual' property above

//EXAMPLE
/*const User = require('USER MODEL')
const main = async ()=>{
    const user = await User.findById('user-id')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}
main() */

//-------------------- CUSTOM DEFINED FUNCTION FOR OUR MODEL ---------------------------

//'statics' METHODS ARE ACCESSIBLE ON THE MODEL
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email : email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

//'methods' METHODS ARE ACCESSIBLE ON THE INSTANCES
//USED IN CREATING-NEW-USER AND LOGGING-IN ANY CURRENT USER
userSchema.methods.generateAuthToken = async function (){
    const user = this

    const token =  jwt.sign({_id : user._id.toString()}, 'THISISMYSECRETKEY')

    //SAVE THE TOKEN ON GENERATION TO DATABASE
    user.tokens = user.tokens.concat({token : token})
    await user.save()
    
    return token
}

//SENDING ONLY LIMITED DATA BACK TO CLIENT 
userSchema.methods.toJSON = function(){
    const user = this

    const userObject = user.toObject() //raw object with user data attached
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//------------------------------------------------------------------------------




//MIDDLEWARE - HASHING THE PASSWORD WITH bcrypt
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


//MIDDLEWARE - DELETE ALL USER-CREATED-TASKS WHEN USER IS DELETED
userSchema.pre('remove', async function(next){
    const user = this

    //deleting multiple tasks using the 'owner' property defined in TASK MODEL
    await Task.deleteMany({owner : user._id})

    next()
})







const User = mongoose.model('User', userSchema)

module.exports = User