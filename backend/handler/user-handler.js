const User = require("../db/user");
const bcrypt = require("bcryptjs"); // Using bcryptjs for security
const jwt = require("jsonwebtoken");

// 🟢 Register User
async function registerUser(model) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(model.password, saltRounds);

  let user = new User({
    name: model.name,
    email: model.email,
    password: hashedPassword,
    isAdmin: model.isAdmin || false, // Default to false
    dob: model.dob,
    gender: model.gender,
    phone: model.phone,
  });

  await user.save();
  return user.toObject();
}

// 🟢 Login User
async function loginUser(email, password) {
  console.log("Attempting login:", email, password);

  const user = await User.findOne({ email });
  if (!user) {
    return { error: "User not found" };
  }

  console.log("User found:", user);

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (isValidPassword) {
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET, // Using environment variable
      { expiresIn: "1h" }
    );

    return { token, user };
  } else {
    return { error: "Invalid password" };
  }
}

// 🟢 Get All Users
async function getUsers() {
  let users = await User.find();
  return users.map((user) => user.toObject());
}

// 🟢 Get User by ID
async function getUserById(id) {
  let user = await User.findById(id);
  if (!user) return null;
  return user.toObject();
}

// 🟢 Update User
async function updateUser(id, model) {
  await User.findByIdAndUpdate(id, model, { new: true });
  return;
}

// 🟢 Delete User
async function deleteUser(id) {
  await User.findByIdAndDelete(id);
  return;
}

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
