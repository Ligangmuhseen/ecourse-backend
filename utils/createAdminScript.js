import mongoose from 'mongoose';
import User from '../models/userModel.js';


const createAdmin = async ( email, password) => {
  try {
    // Check if an admin with the same email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('Admin with this email already exists');
      return;
    }
    
 

    // Create a new admin
    const admin = new User({
      fullname:"User User",
      email,
      location:"My Location",
      password,
      phone_no:"076654523",
      gender:"Male",
      role: 'Admin'
    });

    await admin.save();
    console.log(`${admin.fullname} created successfully`);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

// Example of creating multiple admins
mongoose.connect('mongodb://localhost:27017/DB').then(() => {
  // Pass different details to create more than one admin
  createAdmin('triplerainbow07@gmail.com','12345678')
//   createAdmin('AdminUser', 'admin2@example.com', 'supersecurepassword2');
//   createAdmin('AdminManager', 'admin3@example.com', 'supersecurepassword3')
  
  .then(() => {
    mongoose.connection.close();
  });
});
