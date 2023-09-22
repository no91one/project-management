const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/project_manager'
const connectDB = async ()=>{
    try {
       const connect =  await mongoose.connect(dbUrl,{useUnifiedTopology:true,useNewUrlParser:true});
       console.log("DB connection established at ",`${connect.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}
module.exports = connectDB