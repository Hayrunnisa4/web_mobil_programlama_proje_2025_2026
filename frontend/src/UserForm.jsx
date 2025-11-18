import React, { useState } from 'react';

function UserForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Veri gönderiliyor...');

        try {
            const response = await fetch('http://localhost:3000/api/kullanici-ekle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), 
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage(`✅ Başarılı: ${data.message} (ID: ${data.userId})`);
                setFormData({ name: '', email: '', password: '' }); 
            } else {
                setMessage(`❌ Hata: ${data.message || 'Bilinmeyen bir hata oluştu.'}`);
            }
        } catch (error) {
            setMessage('❌ Bağlantı Hatası: Backend sunucusuna ulaşılamadı.');
            console.error('Gönderim hatası:', error);
        }
    };

    // 🎯 Formun kendisi buradadır (return içindeki JSX)
    return (
        <div>
            <h3>Yeni Kullanıcı Ekle</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">İsim:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">E-posta:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Şifre:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Kaydet</button>
            </form>
            <p style={{ marginTop: '10px' }}>{message}</p>
        </div>
    );
}

export default UserForm;