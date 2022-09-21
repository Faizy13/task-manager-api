//CRUD OPERATIONS

const mongodb = require('mongodb')

const mongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectId

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'


mongoClient.connect(connectionURL, {useNewUrlParser : true}, (error, client)=>{
    if(error)
    {
        return console.log('Unable to connect')
    }

    const db = client.db(databaseName)

    // db.collection('users').insertOne({
    //     name : 'Faizy',
    //     age : 31
    // }, 
    // (error, result)=>{
    //     if(error){
    //         return console.log('Unable to insert user.')
    //     }

    //     console.log(result.acknowledged)
    // })

    // db.collection('users').insertMany([
    //     {
    //         name : 'Asad',
    //         age : 27
    //     },
    //     {
    //         name : 'Moni',
    //         age : 24
    //     }
    // ], (error, result)=>{
    //     if(error)
    //     {
    //         return console.log('Operation Failed!')
    //     }

    //     console.log(result.insertedCount)
    // })

    // db.collection('users').findOne({name : 'Asad'}, (error, result)=>{
    //     if(error)
    //     {
    //         return console.log('Unable to fetch')
    //     }

    //     console.log(result)
    // })

    // db.collection('users').find({age : 27}).toArray((error, result)=>{
    //     console.log(result)
    // })

    db.collection('users').updateOne(
        {
            name : 'Asad'
        },
        {
            $set :{
                name : 'ASAD DON'
            }
        },
    ).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })









})

