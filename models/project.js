const mongoose = require('mongoose');
const date = new Date();
const dueDate = date.getDate()+7;
const projectSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    content:{
        type:String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: {
        type : Date,
        default: dueDate
    },
    tasks:
        [{
            type:mongoose.Schema.Types.ObjectId, ref:'Task'
        }],
    
});

module.exports = mongoose.model('Project',projectSchema)