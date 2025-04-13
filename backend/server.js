const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/MeCare", {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["Patient", "Admin", "Doctor", "Pharmacist"],
    required: true,
  },
  healthDetails: {
    weight: String,
    height: String,
    bloodGroup: String,
  },
});
const User = mongoose.model("User", userSchema);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 0 },
  availability: [String],
});
const Doctor = mongoose.model("Doctor", doctorSchema);

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patientEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Confirmed",
      "Completed",
      "Canceled",
      "Approved",
      "Rejected",
    ],
  },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await Doctor.deleteMany({});
      await Appointment.deleteMany({});
      await User.deleteMany({});

      const doctors = await Doctor.insertMany([
        {
          name: "Dr. Julia Wanton",
          specialty: "Dentist",
          rating: 4.8,
          availability: ["10:00-12:00", "14:00-16:00"],
        },
        {
          name: "Dr. Michael Carter",
          specialty: "Cardiologist",
          rating: 4.5,
          availability: ["09:00-11:00", "13:00-15:00"],
        },
      ]);

      await User.insertMany([
        {
          name: "Admin User",
          email: "admin@example.com",
          password: await bcrypt.hash("admin123", 10),
          role: "Admin",
        },
        {
          name: "Dr. Sarah Lee",
          email: "doctor@example.com",
          password: await bcrypt.hash("doctor123", 10),
          role: "Doctor",
        },
        {
          name: "John Doe",
          email: "patient@example.com",
          password: await bcrypt.hash("patient123", 10),
          role: "Patient",
          healthDetails: { weight: "70", height: "1.75", bloodGroup: "O+" },
        },
        {
          name: "Pharm. Alice Smith",
          email: "pharm@example.com",
          password: await bcrypt.hash("pharm123", 10),
          role: "Pharmacist",
        },
      ]);

      const appointment = new Appointment({
        doctorId: doctors[0]._id,
        patientEmail: "patient@example.com",
        date: "2025-04-12",
        time: "10:00-12:00",
        status: "Pending",
      });
      await appointment.save();

      console.log(
        "Database seeded successfully with appointments linked to patients and doctors"
      );
    } else {
      console.log("Database already contains users, skipping seeding");
    }
  } catch (error) {
    console.error("Seed data error:", error);
  }
};
seedData();

// Authentication Endpoints
app.post("/user/signup", async (req, res) => {
  try {
    const { name, email, password, role, healthDetails } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      healthDetails: role === "Patient" ? healthDetails || {} : undefined,
    });
    await user.save();
    res.status(201).json({
      message: "User created successfully",
      user: { name, email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to sign up", error });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error });
  }
});

// Patients Endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select("-password"); // Exclude password field
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to load patients", error });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete patient", error });
  }
});

// CRUD for Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load users", error });
  }
});

app.put("/api/users/:email", async (req, res) => {
  try {
    const { name, password, role, healthDetails } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { name, password: await bcrypt.hash(password, 10), role, healthDetails },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
});

app.delete("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

// CRUD for Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Failed to load doctors", error });
  }
});

app.post("/api/doctors", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Failed to create doctor", error });
  }
});

app.put("/api/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update doctor", error });
  }
});

app.delete("/api/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete doctor", error });
  }
});

// Appointment Endpoints
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate(
      "doctorId",
      "name specialty"
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.get("/api/appointments/patient/:email", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.params.email,
    }).populate("doctorId", "name specialty");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.get("/api/appointments/doctor/:email", async (req, res) => {
  try {
    const doctor = await User.findOne({
      email: req.params.email,
      role: "Doctor",
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const doctorDoc = await Doctor.findOne({ name: doctor.name });
    if (!doctorDoc)
      return res.status(404).json({ message: "Doctor record not found" });
    const appointments = await Appointment.find({
      doctorId: doctorDoc._id,
    }).populate("doctorId", "name specialty");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const { doctorId, patientEmail, date, time, status } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const appointment = new Appointment({
      doctorId,
      patientEmail,
      date,
      time,
      status,
    });
    await appointment.save();
    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Failed to book appointment", error });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel appointment", error });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  try {
    const { doctorId, patientEmail, date, time, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { doctorId, patientEmail, date, time, status },
      { new: true }
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reschedule appointment", error });
  }
});

app.put("/api/appointments/:id/approve", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending appointments can be approved" });
    appointment.status = "Approved";
    await appointment.save();
    const patient = await User.findOne({ email: appointment.patientEmail });
    console.log(
      `Notified ${patient?.name} (${appointment.patientEmail}): Appointment approved for ${appointment.date} at ${appointment.time}`
    );
    res.json({ message: "Appointment approved", appointment });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve appointment", error });
  }
});

app.put("/api/appointments/:id/reject", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending appointments can be rejected" });
    appointment.status = "Rejected";
    await appointment.save();
    const patient = await User.findOne({ email: appointment.patientEmail });
    console.log(
      `Notified ${patient?.name} (${appointment.patientEmail}): Appointment rejected for ${appointment.date} at ${appointment.time}`
    );
    res.json({ message: "Appointment rejected", appointment });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject appointment", error });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
