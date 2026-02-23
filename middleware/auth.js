const jwt = require('jsonwebtoken');
const db = require('../db/database');

module.exports = function (req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ message: 'Нет токена' });

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(decoded.id);

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Неверный токен' });
  }
};