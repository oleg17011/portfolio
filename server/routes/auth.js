const express    = require('express');
const router     = express.Router();
const User       = require('../models/User');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Этот email уже занят' });
    }

    const safeRole = (role === 'admin' && req.body.adminKey === process.env.ADMIN_KEY)
      ? 'admin'
      : 'user';

    const user = new User({ email, password, role: safeRole });
    await user.save();

    res.status(201).json({ message: 'Регистрация прошла успешно', role: safeRole });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    
    const code    = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); 

    user.twoFACode    = code;
    user.twoFAExpires = expires;
    await user.save();

    
    await transporter.sendMail({
      from:    `"MyPortfolio 2FA" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Ваш код подтверждения',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8faff; border-radius: 16px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">Код подтверждения</h2>
          <p style="color: #64748b; margin-bottom: 24px;">Введите этот код в приложении. Он действует <strong>10 минут</strong>.</p>
          <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e0e7ff;">
            ${code}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Если вы не запрашивали код — проигнорируйте письмо.</p>
        </div>
      `,
    });

    res.json({ message: '2fa_sent', email });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка входа: ' + err.message });
  }
});

router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email и код обязательны' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    
    if (user.twoFACode !== code) {
      return res.status(400).json({ message: 'Неверный код' });
    }

    if (!user.twoFAExpires || user.twoFAExpires < new Date()) {
      return res.status(400).json({ message: 'Код истёк. Войдите снова.' });
    }

    
    user.twoFACode    = null;
    user.twoFAExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id:     user._id,
        email:  user.email,
        role:   user.role,
        name:   user.name   || '',
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка верификации: ' + err.message });
  }
});

module.exports = router;

