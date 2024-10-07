import User from "../../models/userModel.js";

// userController.js
// Adjust the import path based on your project structure

// Create a new user (Admin only)
export const createUser = async (req, res) => {
  const { fullname, email, location, password, phone_no, gender, role } =
    req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    user = new User({
      email,
      fullname,
      password,
      location,
      phone_no,
      gender,
      role,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user (Admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params; // Get the user id from URL parameters
  const { email, fullname, phone_no, gender, location, role, isActive } =
    req.body;

  try {
    // Find user by id
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email already exists (excluding the current user)
    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user fields
    user.email = email || user.email;
    user.fullname = fullname || user.fullname;
    user.phone_no = phone_no || user.phone_no;
    user.gender = gender || user.gender;
    user.location = location || user.location;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); // Adjust depending on your ORM/Database

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};
