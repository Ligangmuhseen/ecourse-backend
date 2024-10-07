import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  fullname: {
    type: String,
    required: true,
   
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role:{
    type:String,
    enum: ['Admin','Client',],
    required:true,
    
  },
  phone_no: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default:true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female',],
    required: true
  },
  profile_photo: {
    type: String, // URL for uploaded profile photo
    default: '/media/profile_photos/default.jpeg' 
  },
}, { timestamps: true });

// Pre-save hook to hash passwords
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password validity
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
