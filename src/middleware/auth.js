const jwt = require('jsonwebtoken')
const User = require('../models/user')



//MIDDLEWARE THEORY
// Request To server --> do something (middleware required) --> run route handler

const auth = async (req, res, next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'THISISMYSECRETKEY')

        const user = await User.findOne({_id : decoded._id, 'tokens.token': token})
        if(!user){
            throw new Error()
        }

        req.user = user
        req.token = token //only delete this token when logout of a specific device
        next()
    } 
    catch (error) {
        res.status(404).send({err : 'Authentication required'})    
    }
}

module.exports = auth