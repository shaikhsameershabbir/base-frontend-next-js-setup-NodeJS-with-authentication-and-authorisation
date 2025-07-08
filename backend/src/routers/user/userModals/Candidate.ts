import mongoose from "mongoose";

// Define the Education schema
const educationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., SSC
  university: { type: String, default: "" },
  institute: { type: String, required: true },
  startYear: { type: String, required: true },
  passingYear: { type: String, required: true },
  status: { type: String, enum: ["pass", "failed"], required: true },
  cgpa: { type: String, default: "" },
  percentage: { type: String, required: true },
});

// Define the Experience schema
const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  jobDescription: { type: String, required: true },
  employmentType: {
    type: String,
    enum: ["fulltime", "partTime", "contract"],
    required: true,
  },
  currentlyWorking: { type: Boolean, required: true },
  jobLocation: { type: String, required: true },
});

// Define the CandidateInfo schema
const candidateInfoSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  profileUrl: { type: String, required: false },
  resumeUrl: { type: String, default: "" },
  skills: { type: [String], default: [] },
  experience_years: { type: Number, default: 0 },
  certifications: { type: [String], default: [] },
  job_preferences: { type: [String], default: [] },
  job_role_preferences: { type: String, default: "" },
  languages_spoken: { type: [String], default: [] },
  video_portfolio_url: { type: String, default: "" },
  expected_salary: { type: Number, default: 0 },
  profile_status: {
    type: String,
    enum: ["complete", "incomplete", "Hidden"],
    default: "incomplete",
  },
  awards_and_honors: { type: [String], default: [] },
  candidateInfo_visibility: {
    type: String,
    enum: ["Hidden", "private", "public"],
    default: "public",
  },
  preferred_job_location: { type: [String], default: [] },
  relocation_preference: { type: Boolean, default: true },
  premium_service_active: { type: Boolean, default: false },
  education: [educationSchema], // Embed the education schema
  experience: [experienceSchema], // Embed the experience schema
});

// Create the CandidateInfo model
const CandidateInfo = mongoose.model("CandidateInfo", candidateInfoSchema);

export default CandidateInfo; // Default export
