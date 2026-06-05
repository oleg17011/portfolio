const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Обязательная проверка токена (для создания/изменения/удаления)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена авторизации' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Токен невалиден или истёк' });
  }
};

// 2. Мягкая проверка токена (для чтения списка проектов гостями и пользователями)
const verifyTokenOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.id);
    } catch (err) {}
  }
  next();
};

// 3. Проверка административных прав
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Не авторизован' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Доступ запрещён. Требуется роль: ${allowedRoles.join(' или ')}` });
    }
    next();
  };
};

module.exports = { verifyToken, verifyTokenOptional, checkRole };