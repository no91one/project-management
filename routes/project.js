const Project = require('../models/project');
const router = require('express').Router();
const Task = require('../models/task');
const auth = require('../config/auth')

router.use(auth.authenticateToken)


router.get('/allprojects', async(req, res) => {
    try {
        const projects = await Project.find({}).populate({
            path: 'createdBy',
            select: 'username', // Specify the fields you want to select (here, only 'name')
          });
        res.render('projects', { projects });
    } catch (error) {
        res.status(500).json(error.message)
    }
});

router.get('/newProject', async (req, res) => {
    try {
        res.render('newProject');
    } catch (error) {
        res.status(500).json(error.message)
    }
});

router.post('/newProject', async (req, res) => {
    try {
      const { name, content, createdBy, updatedBy, dueDate, tasks } = req.body;

      const project = new Project({
        name,
        content,
        createdBy:req.user.user._id,
        updatedBy,
        dueDate,
        tasks,
      });
  
      const savedProject = await project.save();
  
      // Update the user's projects
      if (createdBy) {
        await User.findByIdAndUpdate(createdBy, {
          $addToSet: { projects: savedProject._id },
        });
      }
  
      res.status(201).json({ savedProject });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Update a project
router.put('/:id', async (req, res) => {
    try {
      const { name, content, updatedBy, dueDate, tasks } = req.body;
  
      // Update the project
      const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        { name, content, updatedBy, dueDate, tasks },
        { new: true }
      ).populate('updatedBy');
  
      // Update the user's projects
      if (updatedProject && updatedProject.createdBy) {
        await User.findByIdAndUpdate(updatedProject.createdBy, {
          $addToSet: { projects: updatedProject._id },
        });
      }
  
      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


router.get('/deleteProject/:id',async (req,res)=>{
    try {

        const project = await Project.findById(req.params.id);
        if(!project){
            res.status(404).json("Project not found")
        }
        await Task.deleteMany({_id :{$in:project.tasks}});
        await Project.findByIdAndDelete(req.params.id);
        res.json("Project deleted")
    } catch (error) {
        res.status(500).json(error.message);
    }
});

module.exports = router;