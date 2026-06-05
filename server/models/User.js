const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  
  role: {
    type:    String,
    enum:    ['user', 'admin'],
    default: 'user',
  },

  
  name:    { type: String, default: '' },       
  group:   { type: String, default: '' },       
  iin:     { type: String, default: '' },       
  avatar:  { type: String, default: '' },       

  
  twoFACode:    { type: String,  default: null },  
  twoFAExpires: { type: Date,    default: null },   
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);

