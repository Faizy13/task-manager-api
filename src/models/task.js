const mongoose = require('mongoose')
const validator = require('validator')


const taskSchema = new mongoose.Schema({
    description : {
        type : String,
        trim : true,
        required : true
    },
    completed : {
        type : Boolean,
        default : false
    },
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'User' //Stored in database. We can populate the whole user data if we want by using this relation
    }

},
{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task


// 'ref' PROPERTY USED IN OUR MODEL CAN BE USED TO POPULATE THE WHOLE DATA OF THAT USER
//EXAMPLE:
/*const Task = require('TASK MODEL')
const main = async ()=>{
    const task = await Task.findById('task-id')
    await task.populate('owner').execPopulate()
    console.log(task.owner)
}
main() */
