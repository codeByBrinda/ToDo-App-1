import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateTodo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8000/api/todos';

  useEffect(() => {
    // Fetch the current todo details to populate the form
    const fetchTodo = async () => {
      try {
        const response = await axios.get(API_URL);
        const todo = response.data.todos.find(t => t.sno === parseInt(id));
        if (todo) {
          setTitle(todo.title);
          setDesc(todo.desc);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching todo details:', error);
        setLoading(false);
      }
    };
    fetchTodo();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${id}`, { title, desc });
      navigate('/');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h5 className="mb-3">Update Task</h5>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <input 
            type="text" 
            className="form-control" 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-outline-primary btn-sm me-2">Update</button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
}

export default UpdateTodo;
