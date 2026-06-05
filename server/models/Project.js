const mongoose = require('mongoose');

const codeFileSchema = new mongoose.Schema({
  fileId: { type: String, required: true },
  name: String,
  language: String,
  content: { type: String, default: '' },
  fileUrl: String
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  technologies: [{ type: String, trim: true }],
  diplomaUrl: String,
  codeFiles: [codeFileSchema], 
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);