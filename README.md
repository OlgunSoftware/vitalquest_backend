# VitalQuest Backend API

Express.js ve PostgreSQL ile geliştirilmiş kimlik doğrulama (authentication) backend API'si.

## Özellikler

- ✅ Kullanıcı kaydı (Register)
- ✅ Oturum açma (Login)
- ✅ Kullanıcı bilgilerini getirme
- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Şifre hashleme (bcryptjs)
- ✅ PostgreSQL veritabanı entegrasyonu

## Veritabanı Şeması

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER,
    job TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

## Kurulum

1. PostgreSQL'i yükleyin ve çalıştırın

2. Veritabanı oluşturun:
```bash
createdb vitalquest_db
```

3. Bağımlılıkları yükleyin:
```bash
npm install
```

4. `.env` dosyasını düzenleyin:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitalquest_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

5. Veritabanı tablolarını oluşturun:
```bash
npm run setup-db
```

6. Sunucuyu başlatın:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### 1. Kaydolma (Register)
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "email": "ahmet@example.com",
  "password": "123456",
  "age": 25,
  "job": "Software Developer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kayıt başarılı!",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "email": "ahmet@example.com",
      "age": 25,
      "job": "Software Developer",
      "createdAt": "2025-12-20T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Oturum Açma (Login)
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "ahmet@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Giriş başarılı!",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "email": "ahmet@example.com",
      "age": 25,
      "job": "Software Developer",
      "createdAt": "2025-12-20T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Kullanıcı Bilgilerini Getir
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "email": "ahmet@example.com",
      "age": 25,
      "job": "Software Developer",
      "createdAt": "2025-12-20T...",
      "updatedAt": "2025-12-20T..."
    }
  }
}
```

## Proje Yapısı

```
vitalquest_backend/
├── config/
│   └── database.js          # PostgreSQL bağlantı ayarları
├── controllers/
│   └── authController.js    # Auth işlemleri
├── middleware/
│   └── authMiddleware.js    # JWT doğrulama
├── models/
│   └── userModel.js         # Kullanıcı modeli (PostgreSQL)
├── routes/
│   └── authRoutes.js        # Auth route'ları
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── setup-database.js        # Database kurulum script'i
└── server.js                # Ana sunucu dosyası
```

## Test Etme

Postman veya cURL ile test edebilirsiniz:

```bash
# Kaydolma
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","surname":"User","email":"test@example.com","password":"123456","age":30,"job":"Developer"}'

# Giriş
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Kullanıcı bilgileri (token ile)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Örnek Kullanıcı

Veritabanı kurulumu sonrası test için kullanabileceğiniz örnek kullanıcı:
- **Email:** ahmet@example.com
- **Password:** password123

## Not

Production ortamı için:
- `.env` dosyasındaki `JWT_SECRET` değerini mutlaka değiştirin
- PostgreSQL şifrenizi güvenli tutun
- HTTPS kullanın
- Rate limiting ekleyin
