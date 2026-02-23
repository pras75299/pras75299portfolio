import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'database', 'devops', 'other']
  },
  icon: {
    type: String,
    required: true
  },
  proficiency: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  }
}, {
  timestamps: true
});

skillSchema.index({ createdAt: -1 });

export default mongoose.model('Skill', skillSchema);