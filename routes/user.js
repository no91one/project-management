const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../config/auth');
const express = require('express');

const router = express.Router();

// Render signup form
router.get('/signup', (req, res) => {
    res.render('signup');
});
  
  // Render signin form
router.get('/signin', (req, res) => {
    res.render('signin');
});


router.post('/signup',async (req,res)=>{
    try {
        const {username ,email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({
            username ,
            email,
            password : hashedPassword
        });
        res.status(201).json({message : "Created new user"})
    } catch (error) {
        res.status(500).json(error.message)
    }
})

router.post('/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = auth.generateToken(user);
      res.cookie('jwtToken', token, { httpOnly: true,expires: new Date(Date.now() + 60*60*1000) });
      res.redirect('home');
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.get('/logout', (req, res) => {
    res.clearCookie('jwtToken');
    res.json({ message: 'Logout successful' });
  });


router.use(auth.authenticateToken) 

router.get('/home', async (req, res) => {
    try {
      const userId = req.user.user._id;
      const user = await User.findById(userId).populate({ path: 'tasks', select: 'title' });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.render('home', { user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get('/allusers', async(req, res) => {
    try {
        const users = await User.find({}).populate({path:'tasks',select:'title'});
        res.render('admin', { users });
    } catch (error) {
        res.status(500).json(error.message)
    }
});

  

module.exports = router