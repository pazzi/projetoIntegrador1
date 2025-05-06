const jwt = require('jsonwebtoken');
const { secret } = require('../config/auth.config');

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token.split(' ')[1], secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    req.userId = decoded.id;
    next();
  });
};