const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const cookieParser = require('cookie-parser');


connectDB()

const cors  = require('cors');

const app = express();
const PORT = 2100;

const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use(express.static('./assets'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/users',userRoutes);
app.use('/projects',projectRoutes);
app.use('/tasks',taskRoutes);
// app.use('/project')

app.listen(PORT,()=>{
    console.log(`Server listening at ${PORT}`);
})
