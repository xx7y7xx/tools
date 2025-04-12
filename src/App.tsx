import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PocsagViewer from './Application/PocsagSignalViewer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <PocsagViewer />
      </div>
    </BrowserRouter>
  );
}

export default App;
