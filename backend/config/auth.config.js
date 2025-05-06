module.exports = {
    secret: process.env.JWT_SECRET || "padaria-nutri-secret-key",
    expiresIn: 86400 // 24 horas em segundos
  };