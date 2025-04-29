const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/MeCare", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["Patient", "Admin", "Doctor", "Pharmacist", "Receptionist"],
    required: true,
  },
  healthDetails: {
    weight: String,
    height: String,
    bloodGroup: String,
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    medicalConditions: [String],
    medications: [{ name: String, dosage: String, frequency: String }],
    allergies: [String],
    activityLevel: { type: Number, default: 0 },
    waterIntake: { type: Number, default: 0 },
    predictedWeightTrend: [Number],
  },
  healthHistory: [
    {
      date: { type: Date, default: Date.now },
      weight: String,
      bloodPressure: String,
      heartRate: String,
      temperature: String,
      activityLevel: { type: Number, default: 0 },
      waterIntake: { type: Number, default: 0 },
    },
  ],
});
const User = mongoose.model("User", userSchema);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 0 },
  availability: [String],
  qualifications: { type: String, default: "" },
  experience: { type: String, default: "" },
  contactNumber: { type: String, default: "" },
  bio: { type: String, default: "" },
});
const Doctor = mongoose.model("Doctor", doctorSchema);

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patientEmail: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Confirmed",
      "Queued",
      "Completed",
      "Canceled",
      "Approved",
      "Rejected",
      "Virtual",
    ],
  },
  queuePosition: { type: Number, default: 0 },
});
const Appointment = mongoose.model("Appointment", appointmentSchema);

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patientEmail: { type: String, required: true },
  medications: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
    },
  ],
  datePrescribed: { type: Date, default: Date.now },
  notes: { type: String },
});
const Prescription = mongoose.model("Prescription", prescriptionSchema);

// Initialize Admin User
const initializeAdminUser = async () => {
  try {
    const adminEmail = "rajesh1542004@gmail.com";
    const adminPassword = "adminraj";
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        name: "Rajesh Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
      });
      await adminUser.save();
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
};

// Seed Test Data
const seedTestData = async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const doctors = [
        {
          name: "Peter",
          email: "peter@gmail.com",
          specialty: "General Practitioner",
        },
        { name: "Sanjay", email: "sanjay@gmail.com", specialty: "Cardiology" },
        {
          name: "Alexander",
          email: "alexander@gmail.com",
          specialty: "Dermatology",
        },
      ];
      await Doctor.insertMany(doctors);
      console.log("Test doctors seeded");
    }

    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0) {
      const doctors = await Doctor.find();
      const appointments = [
        {
          doctorId: doctors.find((d) => d.email === "peter@gmail.com")._id,
          patientEmail: "patient@example.com",
          patientName: "Patient",
          date: "2025-05-22",
          time: "10:00-10:30",
          status: "Pending",
        },
        {
          doctorId: doctors.find((d) => d.email === "sanjay@gmail.com")._id,
          patientEmail: "patient@example.com",
          patientName: "Patient",
          date: "2025-05-25",
          time: "09:00-09:30",
          status: "Pending",
        },
        {
          doctorId: doctors.find((d) => d.email === "sanjay@gmail.com")._id,
          patientEmail: "patient@example.com",
          patientName: "John Doe",
          date: "2025-06-26",
          time: "11:00-11:30",
          status: "Pending",
        },
        {
          doctorId: doctors.find((d) => d.email === "sanjay@gmail.com")._id,
          patientEmail: "patient1@example.com",
          patientName: "Patient One",
          date: "2025-07-30",
          time: "09:00-09:30",
          status: "Pending",
        },
        {
          doctorId: doctors.find((d) => d.email === "alexander@gmail.com")._id,
          patientEmail: "anwar@gmail.com",
          patientName: "anwar",
          date: "2025-05-30",
          time: "10:00-10:30",
          status: "Pending",
        },
        {
          doctorId: doctors.find((d) => d.email === "alexander@gmail.com")._id,
          patientEmail: "rxj@gmail.com",
          patientName: "rxj",
          date: "2025-06-15",
          time: "14:00-14:30",
          status: "Pending",
        },
      ];
      await Appointment.insertMany(appointments);
      console.log("Test appointments seeded");
    }
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
};

// Authentication Endpoints
app.post("/user/signup", async (req, res) => {
  try {
    const { name, email, password, role, healthDetails, specialty } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      healthDetails:
        role === "Patient"
          ? {
              weight: healthDetails?.weight || "",
              height: healthDetails?.height || "",
              bloodGroup: healthDetails?.bloodGroup || "",
              bloodPressure: healthDetails?.bloodPressure || "",
              heartRate: healthDetails?.heartRate || "",
              temperature: healthDetails?.temperature || "",
              medicalConditions: healthDetails?.medicalConditions || [],
              medications: healthDetails?.medications || [],
              allergies: healthDetails?.allergies || [],
              activityLevel: healthDetails?.activityLevel || 0,
              waterIntake: healthDetails?.waterIntake || 0,
              predictedWeightTrend: healthDetails?.predictedWeightTrend || [
                parseFloat(healthDetails?.weight || 0),
              ],
            }
          : undefined,
      healthHistory:
        role === "Patient"
          ? [
              {
                date: new Date(),
                weight: healthDetails?.weight || "",
                bloodPressure: healthDetails?.bloodPressure || "",
                heartRate: healthDetails?.heartRate || "",
                temperature: healthDetails?.temperature || "",
                activityLevel: healthDetails?.activityLevel || 0,
                waterIntake: healthDetails?.waterIntake || 0,
              },
            ]
          : [],
    });
    await user.save();

    if (role === "Doctor") {
      const existingDoctor = await Doctor.findOne({ email });
      if (!existingDoctor) {
        const doctor = new Doctor({
          name,
          email,
          specialty: specialty || "General Practitioner",
          availability: [],
        });
        await doctor.save();
        console.log(`Doctor entry created for: ${email}`);
      } else {
        console.log(`Doctor entry already exists for: ${email}`);
      }
    }

    res.status(201).json({
      message: "User created successfully",
      user: { name, email, role },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to sign up", error });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.email, "Role:", user.role);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login", error });
  }
});

// Patients Endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select("-password");
    res.json(patients);
  } catch (error) {
    console.error("Fetch patients error:", error);
    res.status(500).json({ message: "Failed to load patients", error });
  }
});

app.get("/api/patient/:email", async (req, res) => {
  try {
    console.log("Fetching patient with email:", req.params.email);
    const patient = await User.findOne({
      email: req.params.email,
      role: "Patient",
    }).select("-password");
    if (!patient) {
      console.log("Patient not found:", req.params.email);
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    console.error("Fetch patient error:", error);
    res.status(500).json({ message: "Failed to load patient", error });
  }
});

app.get("/api/patients/doctor/:doctorEmail", async (req, res) => {
  try {
    console.log("Fetching patients for doctor email:", req.params.doctorEmail);
    const doctor = await Doctor.findOne({ email: req.params.doctorEmail });
    if (!doctor) {
      console.log("Doctor not found:", req.params.doctorEmail);
      return res.status(404).json({ message: "Doctor not found" });
    }
    const appointments = await Appointment.find({
      doctorId: doctor._id,
    }).distinct("patientEmail");
    const patients = await User.find({
      email: { $in: appointments },
      role: "Patient",
    }).select("-password");
    console.log("Found patients:", patients.length);
    res.json(patients);
  } catch (error) {
    console.error("Fetch doctor patients error:", error);
    res.status(500).json({ message: "Failed to load patients", error });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    console.log(`Attempting to delete patient with ID: ${req.params.id}`);
    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    console.log(`Patient with ID ${req.params.id} deleted successfully`);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({ message: "Failed to delete patient", error });
  }
});

// CRUD for Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Failed to load users", error });
  }
});

app.put("/api/users/:email", async (req, res) => {
  try {
    const { name, password, role, healthDetails } = req.body;
    const updateData = { name, role };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (healthDetails) updateData.healthDetails = healthDetails;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      updateData,
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user", error });
  }
});

app.delete("/api/users/:email", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error });
  }
});

// CRUD for Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error("Fetch doctors error:", error);
    res.status(500).json({ message: "Failed to load doctors", error });
  }
});

app.post("/api/doctors", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (error) {
    console.error("Create doctor error:", error);
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
    console.error("Update doctor error:", error);
    res.status(500).json({ message: "Failed to update doctor", error });
  }
});

app.delete("/api/doctors/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ message: "Failed to delete doctor", error });
  }
});

// Appointment Endpoints
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate(
      "doctorId",
      "name specialty email"
    );
    res.json(appointments);
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.get("/api/appointments/patient/:email", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.params.email,
    })
      .populate("doctorId", "name specialty email")
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error("Fetch patient appointments error:", error);
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.get("/api/appointments/doctor/:email", async (req, res) => {
  try {
    console.log("Fetching appointments for email:", req.params.email);
    const doctor = await User.findOne({
      email: req.params.email,
      role: "Doctor",
    });
    if (!doctor) {
      console.log("Doctor not found:", req.params.email);
      return res.status(404).json({ message: "Doctor not found" });
    }
    console.log("Found doctor:", doctor.name);
    const doctorDoc = await Doctor.findOne({ email: req.params.email });
    if (!doctorDoc) {
      console.log("Doctor record not found for email:", req.params.email);
      return res.status(404).json({ message: "Doctor record not found" });
    }
    console.log("Found doctor record:", doctorDoc.name);
    const appointments = await Appointment.find({
      doctorId: doctorDoc._id,
    }).populate("doctorId", "name specialty email");

    // Fetch patient details for all appointments
    const patientEmails = appointments.map(
      (appointment) => appointment.patientEmail
    );
    const patients = await User.find({
      email: { $in: patientEmails },
      role: "Patient",
    }).select("-password");

    // Merge patient details into appointments
    const appointmentsWithPatients = appointments.map((appointment) => {
      const patient = patients.find(
        (p) => p.email === appointment.patientEmail
      );
      return {
        ...appointment.toObject(),
        patientDetails: patient || { error: "Patient details not found" },
      };
    });

    console.log(
      "Appointments with patient details found:",
      appointmentsWithPatients
    );
    res.json(appointmentsWithPatients);
  } catch (error) {
    console.error("Fetch doctor appointments error:", error);
    res.status(500).json({ message: "Failed to load appointments", error });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const { doctorId, patientEmail, patientName, date, time, status } =
      req.body;

    // Validate doctor existence
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Check for existing appointments for the same doctor, date, and time
    const existingAppointments = await Appointment.find({
      doctorId,
      date,
      time,
    }).sort({ queuePosition: 1 });

    // Calculate queue position (0 for first, 1 for second, etc.)
    const queuePosition = existingAppointments.length;

    // Create new appointment with appropriate status
    const appointment = new Appointment({
      doctorId,
      patientEmail,
      patientName,
      date,
      time,
      status: queuePosition === 0 ? "Confirmed" : "Queued",
      queuePosition,
    });

    await appointment.save();

    // Populate doctor details for the response
    await appointment.populate("doctorId", "name specialty email");

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
      queuePosition,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
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
    console.error("Delete appointment error:", error);
    res.status(500).json({ message: "Failed to cancel appointment", error });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  try {
    const { doctorId, patientEmail, patientName, date, time, status } =
      req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { doctorId, patientEmail, patientName, date, time, status },
      { new: true }
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    console.error("Update appointment error:", error);
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
    console.error("Approve appointment error:", error);
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
    console.error("Reject appointment error:", error);
    res.status(500).json({ message: "Failed to reject appointment", error });
  }
});

app.put("/api/appointments/confirm/:id", async (req, res) => {
  try {
    console.log(`Confirming appointment with ID: ${req.params.id}`);
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    if (!appointment) {
      console.log(`Appointment not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: "Appointment not found" });
    }
    console.log(`Appointment confirmed:`, appointment);
    res.json({ message: "Appointment confirmed", appointment });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    res.status(500).json({ message: "Failed to confirm appointment", error });
  }
});

app.put("/api/appointments/cancel/:id", async (req, res) => {
  try {
    console.log(`Canceling appointment with ID: ${req.params.id}`);
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Canceled" },
      { new: true }
    );
    if (!appointment) {
      console.log(`Appointment not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: "Appointment not found" });
    }
    console.log(`Appointment canceled:`, appointment);
    res.json({ message: "Appointment canceled", appointment });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Failed to cancel appointment", error });
  }
});

app.put("/api/appointments/:id/virtual", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status to indicate it's a virtual appointment
    appointment.status = "Virtual";
    await appointment.save();

    // Optionally, reassign queue positions for remaining appointments in the same slot
    const remainingAppointments = await Appointment.find({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      _id: { $ne: appointment._id },
      status: "Queued",
    }).sort({ queuePosition: 1 });

    // Reassign queue positions
    for (let i = 0; i < remainingAppointments.length; i++) {
      remainingAppointments[i].queuePosition = i + 1;
      await remainingAppointments[i].save();
    }

    res.json({ message: "Appointment set to virtual", appointment });
  } catch (error) {
    console.error("Set virtual appointment error:", error);
    res
      .status(500)
      .json({ message: "Failed to set virtual appointment", error });
  }
});

// Prescription Endpoints
app.get("/api/prescriptions/doctor/:email", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.params.email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const prescriptions = await Prescription.find({
      doctorId: doctor._id,
    }).populate("doctorId", "name specialty");
    res.json(prescriptions);
  } catch (error) {
    console.error("Fetch doctor prescriptions error:", error);
    res.status(500).json({ message: "Failed to load prescriptions", error });
  }
});

app.get("/api/prescriptions/patient/:email", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientEmail: req.params.email,
    }).populate("doctorId", "name specialty");
    res.json(prescriptions);
  } catch (error) {
    console.error("Fetch patient prescriptions error:", error);
    res.status(500).json({ message: "Failed to load prescriptions", error });
  }
});

app.post("/api/prescriptions", async (req, res) => {
  try {
    const { doctorId, patientEmail, medications, notes } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const prescription = new Prescription({
      doctorId,
      patientEmail,
      medications,
      notes,
    });
    await prescription.save();
    res
      .status(201)
      .json({ message: "Prescription created successfully", prescription });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({ message: "Failed to create prescription", error });
  }
});

app.put("/api/prescriptions/:id", async (req, res) => {
  try {
    const { doctorId, patientEmail, medications, notes } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { doctorId, patientEmail, medications, notes },
      { new: true }
    );
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });
    res.json({ message: "Prescription updated successfully", prescription });
  } catch (error) {
    console.error("Update prescription error:", error);
    res.status(500).json({ message: "Failed to update prescription", error });
  }
});

app.delete("/api/prescriptions/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });
    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Delete prescription error:", error);
    res.status(500).json({ message: "Failed to delete prescription", error });
  }
});

// Updated Endpoint to Update Patient Health Details
app.put("/api/patient/:email/health", async (req, res) => {
  try {
    const { email } = req.params;
    const {
      weight,
      height,
      bloodGroup,
      allergies,
      medicalHistory,
      activityLevel,
      waterIntake,
    } = req.body;
    console.log("PUT /api/patient/:email/health called with:", email, req.body);

    const currentWeight = parseFloat(weight || 0);
    const predictedTrend = [currentWeight];
    for (let i = 1; i < 6; i++) {
      predictedTrend.push(predictedTrend[i - 1] + (activityLevel / 100) * 0.2);
    }

    const user = await User.findOneAndUpdate(
      { email, role: "Patient" },
      {
        $set: {
          "healthDetails.weight": weight,
          "healthDetails.height": height,
          "healthDetails.bloodGroup": bloodGroup,
          "healthDetails.allergies": allergies || [],
          "healthDetails.medicalConditions": medicalHistory || [],
          "healthDetails.activityLevel": activityLevel || 0,
          "healthDetails.waterIntake": waterIntake || 0,
          "healthDetails.predictedWeightTrend": predictedTrend,
        },
        $push: {
          healthHistory: {
            date: new Date(),
            weight,
            activityLevel: activityLevel || 0,
            waterIntake: waterIntake || 0,
          },
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      console.log("Patient not found:", email);
      return res.status(404).json({ message: "Patient not found" });
    }

    console.log("Health details updated for:", email);
    res.json({ message: "Health details updated successfully", user });
  } catch (error) {
    console.error("Update health details error:", error);
    res.status(500).json({
      message: "Failed to update health details",
      error,
    });
  }
});

app.get("/api/doctor/details/:email", async (req, res) => {
  try {
    const doctor = await User.findOne({
      email: req.params.email,
      role: "Doctor",
    }).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    const doctorDoc = await Doctor.findOne({ email: req.params.email });
    res.json({ user: doctor, doctorDetails: doctorDoc || {} });
  } catch (error) {
    console.error("Fetch doctor details error:", error);
    res.status(500).json({ message: "Failed to fetch doctor details", error });
  }
});

app.post("/api/doctor/details", async (req, res) => {
  try {
    const {
      email,
      name,
      specialty,
      availability,
      qualifications,
      experience,
      contactNumber,
      bio,
    } = req.body;
    const user = await User.findOne({ email, role: "Doctor" });
    if (!user) return res.status(404).json({ message: "Doctor not found" });

    let doctorDoc = await Doctor.findOne({ email });
    if (!doctorDoc) {
      doctorDoc = new Doctor({
        name: user.name,
        email,
        specialty,
        availability,
        qualifications,
        experience,
        contactNumber,
        bio,
      });
      await doctorDoc.save();
    } else {
      doctorDoc.name = user.name;
      doctorDoc.specialty = specialty;
      doctorDoc.availability = availability;
      doctorDoc.qualifications = qualifications;
      doctorDoc.experience = experience;
      doctorDoc.contactNumber = contactNumber;
      doctorDoc.bio = bio;
      await doctorDoc.save();
    }

    res.json({
      message: "Doctor details saved successfully",
      doctor: doctorDoc,
    });
  } catch (error) {
    console.error("Save doctor details error:", error);
    res.status(500).json({ message: "Failed to save doctor details", error });
  }
});

// Updated Dashboard Endpoint
app.get("/api/doctor-dashboard/:email/:year", async (req, res) => {
  try {
    const { email, year } = req.params;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
    }).populate("doctorId", "name specialty");

    const patients = await User.find({
      email: { $in: appointments.map((a) => a.patientEmail) },
      role: "Patient",
    }).select("-password");

    const appointmentData = appointments.map((appointment, index) => ({
      id: `A${(index + 1).toString().padStart(4, "0")}`,
      patientEmail: appointment.patientEmail,
      patientName: appointment.patientName,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    }));

    const totalPatients = patients.length;
    const newPatients = patients.filter(
      (p) => new Date(p.healthDetails?.dob).getFullYear() === parseInt(year)
    ).length;
    const importantTasks = appointments.filter(
      (a) => a.status === "Pending"
    ).length;
    const highPriorityTasks = Math.floor(importantTasks * 0.3);
    const waitingPatients = appointments.filter(
      (a) => a.status === "Queued"
    ).length; // Updated to reflect queued patients
    const patientIncrease = 120;
    const totalPayments = 64;
    const paymentIncrease = 24;

    const activityData = [
      { month: "Jan", thisYear: 50, previousYear: 40 },
      { month: "Feb", thisYear: 70, previousYear: 60 },
      { month: "Mar", thisYear: 90, previousYear: 80 },
      { month: "Apr", thisYear: 110, previousYear: 100 },
      { month: "May", thisYear: 130, previousYear: 120 },
      { month: "Jun", thisYear: 150, previousYear: 140 },
      { month: "Jul", thisYear: 170, previousYear: 160 },
      { month: "Aug", thisYear: 190, previousYear: 180 },
      { month: "Sep", thisYear: 210, previousYear: 200 },
      { month: "Oct", thisYear: 190, previousYear: 180 },
      { month: "Nov", thisYear: 170, previousYear: 160 },
      { month: "Dec", thisYear: 150, previousYear: 140 },
    ];

    const divisionData = [
      {
        division: "General Physician",
        value:
          patients.length > 0 && doctor.specialty === "General Practitioner"
            ? totalPatients * 0.42
            : 42,
      },
      {
        division: "Internal Medicine",
        value:
          doctor.specialty === "Internal Medicine" ? totalPatients * 0.23 : 23,
      },
      { division: "Skin Specialist", value: 18 },
      { division: "Cardiology", value: 14 },
      { division: "Reproduction", value: 6 },
    ];

    const ageData = [
      {
        range: "5-17 yo",
        value:
          patients.filter(
            (p) => p.healthDetails?.age >= 5 && p.healthDetails?.age <= 17
          ).length * 1000,
      },
      {
        range: "12-25 yo",
        value:
          patients.filter(
            (p) => p.healthDetails?.age >= 12 && p.healthDetails?.age <= 25
          ).length * 1000,
      },
      {
        range: "26-45 yo",
        value:
          patients.filter(
            (p) => p.healthDetails?.age >= 26 && p.healthDetails?.age <= 45
          ).length * 1000,
      },
      {
        range: "46-65 yo",
        value:
          patients.filter(
            (p) => p.healthDetails?.age >= 46 && p.healthDetails?.age <= 65
          ).length * 1000,
      },
    ];

    const genderData = [
      { gender: "Man", value: Math.floor(totalPatients * 0.53) * 1000 },
      { gender: "Woman", value: Math.floor(totalPatients * 0.47) * 1000 },
    ];

    res.json({
      importantTasks,
      highPriorityTasks,
      newPatients,
      waitingPatients,
      totalPatients: (totalPatients / 1000).toFixed(3),
      patientIncrease,
      totalPayments,
      paymentIncrease,
      activityData,
      divisionData,
      ageData,
      genderData,
      appointments: appointmentData,
    });
  } catch (error) {
    console.error("Fetch dashboard data error:", error);
    res.status(500).json({ message: "Failed to load dashboard data", error });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connection.once("open", () => {
  initializeAdminUser();
  seedTestData();
});
