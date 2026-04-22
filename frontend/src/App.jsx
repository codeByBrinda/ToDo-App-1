import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';

import Navbar from './components/Navbar';
import TodoList from './components/TodoList';
import UpdateTodo from './components/UpdateTodo';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container my-4">
        <Routes>
          <Route path="/" element={<TodoList />} />
          <Route path="/update/:id" element={<UpdateTodo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
