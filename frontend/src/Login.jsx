// frontend/src/Login.jsx

import React, { useState } from 'react';

function Login() {
    // 1. Durumlar (State): Email, şifre ve mesajları tutar
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // 2. Form Gönderimini Yönetme
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Giriş yapılıyor...');

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(`✅ ${data.message} Yönlendiriliyor...`);
                
                // 3. Başarılı girişte yönlendirme
                // React uygulamanızda yönlendirme (routing) kurmadığımız için,
                // basitçe tarayıcıyı backend'den gelen adrese yönlendiriyoruz:
                window.location.href = data.redirectUrl; 

            } else {
                setMessage(`❌ Hata: ${data.message}`);
            }

        } catch (error) {
            setMessage('❌ Bağlantı Hatası: Sunucuya ulaşılamadı.');
            console.error('Giriş hatası:', error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Giriş Yap</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>E-posta:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>Şifre:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ padding: '10px 15px' }}>
                    Giriş Yap
                </button>
                {/* Kayıt Ol Butonu (Şimdilik işlevsiz) */}
                <button type="button" style={{ padding: '10px 15px', marginLeft: '10px', backgroundColor: '#eee' }}>
                    Kayıt Ol
                </button>
            </form>
            
            <p style={{ marginTop: '20px', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>
        </div>
    );
}

export default Login;