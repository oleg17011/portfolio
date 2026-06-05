const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const User    = require('../models/User');
const { verifyToken } = require('../middleware/middleware_auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Допустимы только форматы: JPEG, PNG, WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, 
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFACode -twoFAExpires');
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, group, iin } = req.body;

    
    if (iin && !/^\d{12}$/.test(iin)) {
      return res.status(400).json({ message: 'ИИН должен содержать ровно 12 цифр' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name: name?.trim() || '', group: group?.trim() || '', iin: iin?.trim() || '' },
      { new: true, runValidators: true }
    ).select('-password -twoFACode -twoFAExpires');

    res.json({ message: 'Профиль обновлён', user: updated });
  } catch (err) {
    res.status(400).json({ message: 'Ошибка обновления: ' + err.message });
  }
});

router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('avatar');

    res.json({ message: 'Аватар обновлён', avatar: updated.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

