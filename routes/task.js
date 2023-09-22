const Task = require('../models/task');
const Project = require('../models/project');
const User = require('../models/user')
const router = require('express').Router();
const auth = require('../config/auth');

router.use(auth.authenticateToken)


  
router.get('/alltasks', async(req, res) => {
    try {
        const tasks = await Task.find({}).populate({
            path: 'assignedTo',
            select: 'username', // Specify the fields you want to select (here, only 'name')
          }).populate({
            path:'project',
            select:'name'
          })
        res.render('allTasks', { tasks });
    } catch (error) {
        res.status(500).json(error.message)
    }
});

router.get('/newTask', async(req, res) => {
    try {
        res.render('newTask');
    } catch (error) {
        res.status(500).json(error.message)
    }
});

// Create a new task
router.post('/newTask', async (req, res) => {
    try {
      const { title, description, project, assignedTo, priority, status } = req.body;
      const task = new Task({
        title,
        description,
        project,
        assignedTo,
        priority,
        status,
      });
  
      // Save the task
      const savedTask = await task.save();
  
      // Update the project's tasks
      if (project) {
        await Project.findByIdAndUpdate(project, { $push: { tasks: savedTask._id } });
      }
  
      // Update the user's tasks
      if (assignedTo) {
        await User.findByIdAndUpdate(assignedTo, { $push: { tasks: savedTask._id } });
      }
  
      res.json(savedTask);
    } catch (error) {
      res.status(500).json(error.message);
    }
  });

// Create a new task for a project
router.post('/:projectId', async (req, res) => {
    try {
      const { title, description, status, assignedTo } = req.body;
      const project = await Project.findById(req.params.projectId);
      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      const task = await Task.create({
        title,
        description,
        status,
        project: project._id,
        assignedTo,
      });
      project.tasks.push(task._id);
      await project.save();
  
      // Update the user's tasks
      if (assignedTo) {
        await User.findByIdAndUpdate(assignedTo, { $push: { tasks: task._id } });
      }
  
      res.json({ message: 'Task created successfully', task });
    } catch (error) {
      res.status(500).json(error.message);
    }
  });

//Add this task to this project
router.post('/:projectId/:id',async (req,res)=>{
    try {
        const task = await Task.findById(req.params.id);
        if(!task){
            res.status(404).json("Task not found");
        }
        await Project.findByIdAndUpdate(req.params.projectId,{$push:{tasks:task._id}});
        await Task.findByIdAndUpdate(req.params.id,{project:req.params.projectId},{new:true});
        res.json(`Task added to Project ${req.params.projectId}`)
    } catch (error) {
        res.status(500).json(error.message);
    }
});

router.put('//updatetask/:id',async (req,res)=>{
    try {
        const {title, description,status} = req.body;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id,{title, description, status},{new:true});
        res.json(updatedTask)
    } catch (error) {
        res.status(500).json(error.message);
    }
});

router.get('/deletetask/:id',async (req,res)=>{
    try {
        const task = await Task.findById(req.params.id);
        if(!task){
            res.status(404).json("Task not found");
        }
        await Project.findByIdAndUpdate(task.project,{$pull:{tasks:task._id}});
        await Task.findByIdAndDelete(req.params.id);
        res.json("Task deleted")
    } catch (error) {
        res.status(500).json(error.message);
    }
});

module.exports = router;