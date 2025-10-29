# SIMS PPOB API - Technical Test

REST API untuk sistem PPOB (Payment Point Online Bank) yang mencakup fitur registrasi, login, management profile, top up saldo, dan transaksi pembayaran layanan.

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer

## 🚀 Cara Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd sims-ppob-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Jalankan script SQL yang ada di `database/schema.sql` untuk membuat database dan table:

```bash
mysql -u root -p < database/schema.sql
```

atau import manual melalui MySQL client/phpMyAdmin.

### 4. Setup Environment Variables

Copy file `.env.example` menjadi `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sims_ppob
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=12h

UPLOAD_PATH=./uploads/
MAX_FILE_SIZE=102400
```

### 5. Jalankan Aplikasi

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
sims-ppob-api/
├── database/
│   └── schema.sql              # DDL Database
├── src/
│   ├── config/
│   │   └── database.js         # Konfigurasi database
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── profile.controller.js
│   │   ├── information.controller.js
│   │   └── transaction.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── validators/
│   │   └── request.validator.js
│   ├── routes/
│   │   └── index.js
│   └── server.js               # Entry point
├── uploads/                    # Folder untuk file upload
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/registration` | Register user baru |
| POST | `/login` | Login user |

### Protected Endpoints (Memerlukan Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get profile user |
| PUT | `/profile/update` | Update profile user |
| PUT | `/profile/image` | Update profile image |
| GET | `/banner` | Get list banner |
| GET | `/services` | Get list services |
| GET | `/balance` | Get saldo user |
| POST | `/topup` | Top up saldo |
| POST | `/transaction` | Transaksi pembayaran |
| GET | `/transaction/history` | Get riwayat transaksi |

## 📝 Contoh Request

### 1. Registration

```bash
POST /registration
Content-Type: application/json

{
  "email": "user@nutech-integrasi.com",
  "first_name": "User",
  "last_name": "Nutech",
  "password": "abcdef1234"
}
```

### 2. Login

```bash
POST /login
Content-Type: application/json

{
  "email": "user@nutech-integrasi.com",
  "password": "abcdef1234"
}
```

Response:
```json
{
  "status": 0,
  "message": "Login Sukses",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Profile

```bash
GET /profile
Authorization: Bearer <token>
```

### 4. Top Up

```bash
POST /topup
Authorization: Bearer <token>
Content-Type: application/json

{
  "top_up_amount": 100000
}
```

### 5. Transaction

```bash
POST /transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "service_code": "PULSA"
}
```

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Setelah login, gunakan token yang diterima di header:

```
Authorization: Bearer <your_token>
```

## ⚙️ Fitur Utama

### 1. Raw Query dengan Prepared Statement
Semua query database menggunakan prepared statement untuk mencegah SQL Injection:

```javascript
const [users] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

### 2. Transaction Management
Operasi yang melibatkan multiple queries menggunakan database transaction:

```javascript
const connection = await db.getConnection();
await connection.beginTransaction();
// ... queries
await connection.commit();
```

### 3. Error Handling
Implementasi comprehensive error handling untuk validasi input dan database errors.

### 4. Balance Management
Sistem perhitungan saldo yang akurat:
- Top up menambah saldo
- Transaksi mengurangi saldo
- Validasi saldo mencukupi sebelum transaksi

## 🧪 Testing API

### Persiapan Testing

1. Pastikan server sudah berjalan di `http://localhost:3000`
2. Siapkan API Client (Postman / Thunder Client / cURL)
3. Ikuti flow testing dibawah secara berurutan

### Flow Testing Lengkap

#### **Step 1: Registration**

**Endpoint:** `POST http://localhost:3000/registration`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "user@nutech-integrasi.com",
  "first_name": "User",
  "last_name": "Nutech",
  "password": "abcdef1234"
}
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Registrasi berhasil silahkan login",
  "data": null
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/registration \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@nutech-integrasi.com",
    "first_name": "User",
    "last_name": "Nutech",
    "password": "abcdef1234"
  }'
```

---

#### **Step 2: Login**

**Endpoint:** `POST http://localhost:3000/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "user@nutech-integrasi.com",
  "password": "abcdef1234"
}
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Login Sukses",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ PENTING:** Simpan token dari response ini untuk digunakan di endpoint selanjutnya!

**cURL:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@nutech-integrasi.com",
    "password": "abcdef1234"
  }'
```

---

#### **Step 3: Get Profile**

**Endpoint:** `GET http://localhost:3000/profile`

**Headers:**
```
Authorization: Bearer <token_dari_login>
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Sukses",
  "data": {
    "email": "user@nutech-integrasi.com",
    "first_name": "User",
    "last_name": "Nutech",
    "profile_image": "https://yoururlapi.com/profile.jpeg"
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### **Step 4: Update Profile**

**Endpoint:** `PUT http://localhost:3000/profile/update`

**Headers:**
```
Authorization: Bearer <token_dari_login>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "first_name": "User Updated",
  "last_name": "Nutech Updated"
}
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Update Profile berhasil",
  "data": {
    "email": "user@nutech-integrasi.com",
    "first_name": "User Updated",
    "last_name": "Nutech Updated",
    "profile_image": "https://yoururlapi.com/profile.jpeg"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/profile/update \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "User Updated",
    "last_name": "Nutech Updated"
  }'
```

---

#### **Step 5: Update Profile Image**

**Endpoint:** `PUT http://localhost:3000/profile/image`

**Headers:**
```
Authorization: Bearer <token_dari_login>
Content-Type: multipart/form-data
```

**Body (Form-Data):**
- Key: `file`
- Type: File
- Value: Pilih file gambar (.jpg/.png, max 100KB)

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Update Profile Image berhasil",
  "data": {
    "email": "user@nutech-integrasi.com",
    "first_name": "User Updated",
    "last_name": "Nutech Updated",
    "profile_image": "http://localhost:3000/uploads/profile-1234567890.jpg"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/image.jpg"
```

---

#### **Step 6: Get Banner**

**Endpoint:** `GET http://localhost:3000/banner`

**Headers:**
```
Authorization: Bearer <token_dari_login>
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Sukses",
  "data": [
    {
      "banner_name": "Banner 1",
      "banner_image": "https://nutech-integrasi.app/dummy.jpg",
      "description": "Lerem Ipsum Dolor sit amet"
    },
    ...
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:3000/banner \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### **Step 7: Get Services**

**Endpoint:** `GET http://localhost:3000/services`

**Headers:**
```
Authorization: Bearer <token_dari_login>
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Sukses",
  "data": [
    {
      "service_code": "PAJAK",
      "service_name": "Pajak PBB",
      "service_icon": "https://nutech-integrasi.app/dummy.jpg",
      "service_tariff": 40000
    },
    {
      "service_code": "PLN",
      "service_name": "Listrik",
      "service_icon": "https://nutech-integrasi.app/dummy.jpg",
      "service_tariff": 10000
    },
    ...
  ]
}
```

**cURL:**
```bash
curl -X GET http://localhost:3000/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### **Step 8: Get Balance**

**Endpoint:** `GET http://localhost:3000/balance`

**Headers:**
```
Authorization: Bearer <token_dari_login>
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Get Balance Berhasil",
  "data": {
    "balance": 0
  }
}
```

**cURL:**
```bash
curl -X GET http://localhost:3000/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### **Step 9: Top Up Balance**

**Endpoint:** `POST http://localhost:3000/topup`

**Headers:**
```
Authorization: Bearer <token_dari_login>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "top_up_amount": 100000
}
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Top Up Balance berhasil",
  "data": {
    "balance": 100000
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/topup \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "top_up_amount": 100000
  }'
```

---

#### **Step 10: Transaction (Payment)**

**Endpoint:** `POST http://localhost:3000/transaction`

**Headers:**
```
Authorization: Bearer <token_dari_login>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "service_code": "PULSA"
}
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Transaksi berhasil",
  "data": {
    "invoice_number": "INV29102025-0001",
    "service_code": "PULSA",
    "service_name": "Pulsa",
    "transaction_type": "PAYMENT",
    "total_amount": 40000,
    "created_on": "2025-10-29T10:30:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/transaction \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "service_code": "PULSA"
  }'
```

---

#### **Step 11: Get Transaction History**

**Endpoint:** `GET http://localhost:3000/transaction/history`

**Query Parameters (Optional):**
- `offset`: untuk pagination (default: 0)
- `limit`: jumlah data per page (default: semua data)

**Headers:**
```
Authorization: Bearer <token_dari_login>
```

**Example dengan pagination:**
```
GET http://localhost:3000/transaction/history?offset=0&limit=3
```

**Expected Response (200):**
```json
{
  "status": 0,
  "message": "Get History Berhasil",
  "data": {
    "offset": 0,
    "limit": 3,
    "records": [
      {
        "invoice_number": "INV29102025-0001",
        "transaction_type": "PAYMENT",
        "description": "Pulsa",
        "total_amount": 40000,
        "created_on": "2025-10-29T10:30:00.000Z"
      },
      {
        "invoice_number": "INV29102025-0002",
        "transaction_type": "TOPUP",
        "description": "Top Up Balance",
        "total_amount": 100000,
        "created_on": "2025-10-29T10:25:00.000Z"
      }
    ]
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/transaction/history?offset=0&limit=3" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 📝 Testing Error Cases

#### 1. **Test Email sudah terdaftar**
```bash
# Daftar dengan email yang sama 2x
POST /registration
```
Expected: Status 102, "Email sudah terdaftar"

#### 2. **Test Login dengan password salah**
```bash
POST /login
{
  "email": "user@nutech-integrasi.com",
  "password": "wrongpassword"
}
```
Expected: Status 103, "Username atau password salah"

#### 3. **Test Akses tanpa token**
```bash
GET /profile
# Tanpa header Authorization
```
Expected: Status 108, "Token tidak tidak valid atau kadaluwarsa"

#### 4. **Test Top Up dengan amount invalid**
```bash
POST /topup
{
  "top_up_amount": -1000
}
```
Expected: Status 102, validasi error

#### 5. **Test Transaction dengan saldo tidak cukup**
```bash
# Pastikan balance < service tariff
POST /transaction
{
  "service_code": "QURBAN"  # Tariff 200000
}
```
Expected: Status 102, "Saldo tidak mencukupi"

#### 6. **Test Upload file > 100KB**
```bash
PUT /profile/image
# Upload file > 100KB
```
Expected: Status 102, "File size exceeds 100KB"

#### 7. **Test Upload file bukan gambar**
```bash
PUT /profile/image
# Upload file .pdf atau .txt
```
Expected: Status 102, "Format Image tidak sesuai"

---

### 🔧 Tips Testing dengan Postman

1. **Buat Environment:**
   - Variable: `base_url` = `http://localhost:3000`
   - Variable: `token` = kosongkan dulu

2. **Set Token Otomatis setelah Login:**
   Tambahkan script di tab "Tests" pada endpoint login:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.data.token);
   ```

3. **Gunakan Variable di Request:**
   - URL: `{{base_url}}/profile`
   - Header Authorization: `Bearer {{token}}`

4. **Buat Collection dengan Request Berurutan:**
   - Registration
   - Login (auto save token)
   - Get Profile
   - dst...

---

### 🔧 Tips Testing dengan Thunder Client (VS Code)

1. **Install Extension:** Thunder Client di VS Code
2. **Buat Collection:** SIMS PPOB API
3. **Set Environment:**
   ```json
   {
     "base_url": "http://localhost:3000",
     "token": ""
   }
   ```
4. **Test Request satu per satu** sesuai flow diatas

---

### ✅ Checklist Testing

Pastikan semua endpoint ini berhasil ditest:

- [ ] ✅ Registration berhasil
- [ ] ✅ Login berhasil & dapat token
- [ ] ✅ Get Profile dengan token
- [ ] ✅ Update Profile berhasil
- [ ] ✅ Update Profile Image berhasil
- [ ] ✅ Get Banner berhasil
- [ ] ✅ Get Services berhasil
- [ ] ✅ Get Balance (awal = 0)
- [ ] ✅ Top Up berhasil (balance bertambah)
- [ ] ✅ Transaction berhasil (balance berkurang)
- [ ] ✅ Get History berhasil (ada record TOPUP & PAYMENT)
- [ ] ✅ Pagination History berfungsi
- [ ] ✅ Error handling bekerja (test error cases)

---

### 📊 Validasi Balance Calculation

**Scenario Test:**
1. Balance awal: 0
2. Top Up 100.000 → Balance: 100.000
3. Transaction PULSA (40.000) → Balance: 60.000
4. Transaction PLN (10.000) → Balance: 50.000
5. Top Up 50.000 → Balance: 100.000

Pastikan perhitungan balance selalu akurat!

## 📊 Database Design

Database terdiri dari 5 tabel utama:

1. **users** - Data user
2. **balances** - Saldo user
3. **services** - Master data layanan
4. **banners** - Master data banner
5. **transactions** - Riwayat transaksi

Detail schema dapat dilihat di `database/schema.sql`

## 🛡️ Security Features

- Password hashing menggunakan bcryptjs
- JWT token authentication
- Input validation menggunakan express-validator
- Prepared statement untuk mencegah SQL Injection
- File upload validation (type & size)

## 👨‍💻 Developer

- **Position**: NodeJs Programmer
- **Assignment**: Nutech Integration Technical Test
- **Framework**: Express.js
- **Database**: MySQL with Raw Query & Prepared Statement

## 📄 License

ISC

---

**Note**: Pastikan MySQL server sudah berjalan sebelum menjalankan aplikasi.