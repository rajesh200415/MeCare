const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // Import the User model

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/MeCare", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Function to generate a unique patientId
const generatePatientId = async () => {
  const prefix = "PAT";
  let isUnique = false;
  let patientId;

  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    patientId = `${prefix}${randomNum}`; // e.g., PAT123456
    const existingUser = await User.findOne({ patientId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return patientId;
};

// Register endpoint
app.post("/user/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patientId = role === "Patient" ? await generatePatientId() : null;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      patientId,
      healthDetails:
        role === "Patient"
          ? {
              weight: "",
              height: "",
              bloodGroup: "",
              allergies: "",
              medicalHistory: "",
            }
          : undefined,
      appointments: [],
      encounters: [],
    });

    await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: { email, name, role, patientId },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login endpoint
app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        patientId: user.patientId,
      },
      token: "dummy-token",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Health details endpoint
app.get("/user/health-details/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      healthDetails: user.healthDetails,
      name: user.name,
      patientId: user.patientId,
    });
  } catch (error) {
    console.error("Error fetching health details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update health details endpoint
app.put("/user/health-details/:email", async (req, res) => {
  const { email } = req.params;
  const { weight, height, bloodGroup, allergies, medicalHistory } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.healthDetails = {
      weight,
      height,
      bloodGroup,
      allergies,
      medicalHistory,
    };
    await user.save();
    res.json({
      message: "Health details updated successfully",
      healthDetails: user.healthDetails,
    });
  } catch (error) {
    console.error("Error updating health details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
