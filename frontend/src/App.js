// frontend/src/App.js

import React from 'react';
import UserForm from './Login'; // Formu içeri aktar

function App() {
  return (
    <div className="App" style={{ padding: '20px', textAlign: 'center' }}>
      <h1>PostgreSQL (Cloud SQL) Veri Girişi ve Testi</h1>
      <UserForm /> 
    </div>
  );
}

export default App;