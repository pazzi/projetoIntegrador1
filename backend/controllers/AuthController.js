const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { secret } = require('../config/auth.config');

const AuthController = {
  async register(req, res) {
    try {
      const { name, email, phone, address, password } = req.body;

      // Verifica se o usuário já existe
      const userExists = await new Promise((resolve, reject) => {
        User.findByEmail(email, (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
        });
      });

      if (userExists) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
      }

      // Criptografa a senha
      const hashedPassword = bcrypt.hashSync(password, 8);

      // Cria o usuário
      await new Promise((resolve, reject) => {
        User.create({ name, email, phone, address, password: hashedPassword }, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Busca o usuário
      const user = await new Promise((resolve, reject) => {
        User.findByEmail(email, (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        });
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verifica a senha
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).json({ message: 'Senha inválida' });
      }

      // Gera o token JWT
      const token = jwt.sign({ id: user.id }, secret, {
        expiresIn: 86400 // 24 horas
      });

      // Remove a senha antes de retornar
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  },

  async getUserProfile(req, res) {
  //async profile(req, res) {

    try {
      const userId = req.userId;

      const user = await new Promise((resolve, reject) => {
        User.findById(userId, (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        });
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
    }
  }
};

module.exports = AuthController;