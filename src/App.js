import React from 'react';
import './App.css';
import Chatbot from './chatbot';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Clínica UDB - Asistente Virtual</h1>
      </header>
      <main>
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
