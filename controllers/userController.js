import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";


// User Registration
export const registerUser = async (req, res) => {
  const { fullname,email, password, phone_no, location,gender,role, profilePhoto } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = await User.create({
      fullname,  
      email,
      password,
      phone_no,
      gender,
      location,
      role,
      profilePhoto
    });

    
    res.status(201).json({
      _id: user._id,
      message: "User Registered Successfully",
      
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     // Check if the user is available
     if (!user.isActive) {
      return res.status(403).json({ message: 'User account is Disabled' });
    }


    // Check if the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Return user data with JWT token
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role:user.role,
      message: "User Login Successfully",
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};



// Admin Login Controller
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

       // Check if the user is available
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is Disabled' });
    }

  
      // Compare password
      const isMatch = await user.matchPassword(password);
    
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Check if user role is Admin
      if (user.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied: You do not have admin privileges." });
      }
  
      // Generate JWT token
      const token = generateToken(user._id);
  
      res.status(200).json({
        message: "Login successful",
        token,
        role: user.role
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  


// This function returns the information of the logged-in user
export const getUserProfile = async (req, res) => {
    try {
      // req.user is set in the authMiddleware, so we can directly access it
      if (req.user) {
        res.status(200).json({
          id: req.user._id,
          fullname: req.user.fullname,
          email: req.user.email,
          phone_no: req.user.phone_no,
          gender: req.user.gender,
          role: req.user.role,
          location:req.user.location,
          profile_photo: req.user.profile_photo, // if profile photo exists
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };


  // Update the logged-in user's profile
export const updateUserProfile = async (req, res) => {
    try {
      // req.user is populated by authMiddleware
      const user = req.user;
  
      if (user) {
        // Update fields only if provided in the request body
        user.fullname = req.body.fullname || user.fullname;
        user.email = req.body.email || user.email;
        user.phone_no = req.body.phone_no || user.phone_no;
        user.location = req.body.location || user.location;
        user.gender = req.body.gender || user.gender;
  
        // If profile photo is provided, update it
        
        if (req.file) {
          user.profile_photo = `/media/profile_photos/${req.file.filename}`;
        }
  
        // Save updated user info
        const updatedUser = await user.save();
  
        res.status(200).json({
          message: "Profile updated successfully",
          user: {
            id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            phone_no: updatedUser.phone_no,
            gender: updatedUser.gender,
            profile_photo: updatedUser.profile_photo,
          },
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };




  
  export const changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // Assuming user ID is available from authentication middleware
  
      // Find the user by ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
  
      // Validate new password (add your own validation rules here)
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
  
      
  
      // Update the user's password
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
  
  
