import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  current: {
    type: Boolean,
    default: false
  },
  description: [{
    type: String,
    required: true
  }],
  technologies: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

export default mongoose.model('Experience', experienceSchema);