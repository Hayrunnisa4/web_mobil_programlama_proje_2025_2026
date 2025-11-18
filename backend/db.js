// backend/server.js

const express = require('express');
// ⚠️ db.js dosyasını içe aktarın
const { testDbConnection } = require('./db'); 
// ⚠️ .env'den PORT'u almak için dotenv'i de burada çağırabilirsiniz
require('dotenv').config(); 

const app = express();
// PORT'u .env dosyasından alın
const port = process.env.PORT || 3000; 

// ----------------------------------------------------
// 🎯 BAĞLANTI TESTİ 
// Sunucu başlamadan hemen önce veritabanı bağlantısını kontrol et
testDbConnection(); 
// ----------------------------------------------------

// Sunucuya gelen JSON isteklerini ayrıştırmak için middleware
app.use(express.json());

// Basit bir test endpoint'i (API)
app.get('/', (req, res) => {
  res.send('Backend Sunucusu Calisiyor!');
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde baslatildi.`);
});