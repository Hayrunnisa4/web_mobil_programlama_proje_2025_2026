// backend/index.js

// 1. Ortam Değişkenlerini Yükle
require('dotenv').config(); 
const path = require('path'); 
const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000; 

// ----------------------------------------------------
// PostgreSQL Bağlantı Ayarları
// ----------------------------------------------------
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ... testDbConnection() fonksiyonu buraya kopyalanmalı ... 
// (Fonksiyonun kendisini değiştirmedim, varsayılan halini koruyun)
async function testDbConnection() { /* ... */ }


// ----------------------------------------------------
// 2. SUNUCU MANTIĞI VE ENDPOINT'LER (TEST BAŞARILI İSE ÇALIŞIR)
// ----------------------------------------------------

testDbConnection().then(() => {
    
    // 🎯 MİDDLEWARE'LERİN DOĞRU TANIMLANDIĞI YER
    app.use(cors()); // CORS sadece bir kez tanımlanır
    app.use(express.json()); // JSON body parser sadece bir kez tanımlanır
    
    // Statik React dosyalarını sunma ayarı
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

    // Basit bir test endpoint'i
    app.get('/', (req, res) => {
        res.send('Backend Sunucusu ve DB Testi Calisiyor!');
    });
    
    // --- VERİ ÇEKME ENDPOINT'İ (GET) ---
    app.get('/api/vericekme', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM users'); 
            res.status(200).json({ success: true, data: result.rows });
        } catch (err) {
            console.error("Veritabanından veri çekme hatası:", err.message);
            res.status(500).json({ success: false, message: "Veri çekilirken sunucu hatası oluştu." });
        }
    });

    // --- KULLANICI EKLEME ENDPOINT'İ (POST) ---
    app.post('/api/kullanici-ekle', async (req, res) => {
        const { name, email, password } = req.body; 
        
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Tüm alanlar zorunludur." });
        }

        try {
            const insertQuery = `
                INSERT INTO users (name, email, password) 
                VALUES ($1, $2, $3)
                RETURNING id; 
            `;
            const result = await pool.query(insertQuery, [name, email, password]);
            
            res.status(201).json({
                success: true,
                message: "Kullanıcı başarıyla eklendi.",
                userId: result.rows[0].id
            });

        } catch (err) {
            console.error("Veritabanına veri yazma hatası:", err.message);
            res.status(500).json({
                success: false,
                message: "Kullanıcı eklenirken sunucu hatası oluştu."
            });
        }
    });

	app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "E-posta ve şifre zorunludur." });
    }

    try {
        // 1. Veritabanından kullanıcıyı e-posta ile bul
        const userQuery = 'SELECT id, email, password FROM users WHERE email = $1;';
        const result = await pool.query(userQuery, [email]);
        const user = result.rows[0];

        if (!user) {
            // Kullanıcı bulunamadı
            return res.status(401).json({ success: false, message: "Kullanıcı adı veya şifre hatalı." });
        }

        // 2. Şifreyi kontrol et (Şifre şifrelenmediği için doğrudan karşılaştırıyoruz)
        if (user.password === password) {
            // Erişim başarılı: Kullanıcıyı yönlendirmek için bir token veya basit bir başarı mesajı gönder
            return res.status(200).json({ 
                success: true, 
                message: "Giriş başarılı!", 
                redirectUrl: "/dashboard" // Başarılı girişte yönlendirilecek hayali sayfa
            });
        } else {
            // Şifre hatalı
            return res.status(401).json({ success: false, message: "Kullanıcı adı veya şifre hatalı." });
        }

    } catch (err) {
        console.error("Giriş işlemi hatası:", err.message);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
});
    // --- REACT ROUTER FALLBACK AYARI ---
	app.use((req, res, next) => {
		// Sadece GET istekleri için fallback yap
		if (req.method === 'GET' && !req.path.startsWith('/api')) {
			res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
		} else {
			next(); // Diğer istekleri (POST, vb.) normal akışına devam ettir
		}
	});

    // Sunucuyu başlat (test başarılıysa)
    app.listen(port, () => {
        console.log(`Sunucu http://localhost:${port} adresinde baslatildi.`);
    });
    
});