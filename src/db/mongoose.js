const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{
    //MIGRATION GUIDE : https://mongoosejs.com/docs/migrating_to_6.html
    // useNewUrlParser : true, //No longer necessary in version 6.X of mongoose
    // useCreateIndex : true    //No longer necessary in version 6.X of mongoose
})
