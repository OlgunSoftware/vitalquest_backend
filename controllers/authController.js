const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Kaydolma (Register)
const register = async (req, res) => {
  try {
    const { name, surname, email, password, age, job } = req.body;

    // Validation
    if (!name || !surname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'İsim, soyisim, email ve şifre gereklidir!'
      });
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi girin!'
      });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır!'
      });
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanımda!'
      });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const result = await pool.query(
      `INSERT INTO users (name, surname, email, password, age, job, xp_value, vp_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, surname, email, age, job, xp_value, vp_value, created_at, updated_at`,
      [name, surname, email, hashedPassword, age || null, job || null, 0, 0]
    );

    const user = result.rows[0];

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          age: user.age,
          job: user.job,
          xpValue: user.xp_value,
          vp_value: user.vp_value,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu!'
    });
  }
};

// Oturum açma (Login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir!'
      });
    }

    // Kullanıcıyı bul
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı!'
      });
    }

    const user = result.rows[0];

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı!'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          age: user.age,
          job: user.job,
          xpValue: user.xp_value,
          vp_value: user.vp_value,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu!'
    });
  }
};

// Kullanıcı bilgilerini getir
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, surname, email, age, job, xp_value, created_at, updated_at, vp_value
       FROM users 
       WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          age: user.age,
          job: user.job,
          xpValue: user.xp_value,
          vpValue: user.vp_value,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu!'
    });
  }
};

// XP değerini güncelle (pozitif = ekle, negatif = çıkar)
const updateXp = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir XP miktarı girin!'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET xp_value = GREATEST(xp_value + $1, 0), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, surname, email, age, job, xp_value, created_at, updated_at`,
      [amount, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    const user = result.rows[0];
    const message = amount >= 0 ? `${amount} XP eklendi!` : `${Math.abs(amount)} XP çıkarıldı!`;

    res.status(200).json({
      success: true,
      message,
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          age: user.age,
          job: user.job,
          xpValue: user.xp_value,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update XP error:', error);
    res.status(500).json({
      success: false,
      message: 'XP güncellenirken bir hata oluştu!'
    });
  }
};

// VP değerini güncelle (pozitif = ekle, negatif = çıkar)
const updateVp = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== 'number' || !Number.isInteger(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir VP miktarı girin (tam sayı olmalı)!'
      });
    }

    const result = await pool.query(
      `UPDATE users 
       SET vp_value = GREATEST(vp_value + $1, 0), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, surname, email, age, job, xp_value, vp_value, created_at, updated_at`,
      [amount, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      });
    }

    const user = result.rows[0];
    const message = amount >= 0 ? `${amount} VP eklendi!` : `${Math.abs(amount)} VP çıkarıldı!`;

    res.status(200).json({
      success: true,
      message,
      data: {
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          age: user.age,
          job: user.job,
          xpValue: user.xp_value,
          vpValue: user.vp_value,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update VP error:', error);
    res.status(500).json({
      success: false,
      message: 'VP güncellenirken bir hata oluştu!'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateXp,
  updateVp
};
