import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import dayjs from 'dayjs';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [total, setTotal] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter') || '';
  const search = searchParams.get('search') || '';

  const API_URL = 'http://localhost:8000/api/todos';

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL, {
        params: { filter, search }
      });
      setTodos(response.data.todos);
      setTotal(response.data.total);
      setCompletedCount(response.data.completed);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filter, search]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { title, desc, deadline });
      setTitle('');
      setDesc('');
      setDeadline('');
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleComplete = async (sno) => {
    try {
      await axios.patch(`${API_URL}/${sno}/complete`);
      fetchTodos();
    } catch (error) {
      console.error('Error toggling complete status:', error);
    }
  };

  const handleDelete = async (sno, title) => {
    if (window.confirm(`Delete: ${title} ?`)) {
      try {
        await axios.delete(`${API_URL}/${sno}`);
        fetchTodos();
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  return (
    <div className="row">
      {/* LEFT */}
      <div className="col-md-8">
        <div className="card p-4 shadow-sm mb-4">
          <h5 className="mb-3">Add Task</h5>
          <form onSubmit={handleAddTodo}>
            <input 
              type="text" 
              className="form-control mb-2" 
              placeholder="Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              className="form-control mb-2" 
              placeholder="Description" 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              required 
            />
            <input 
              type="datetime-local" 
              className="form-control mb-3" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
            />
            <button type="submit" className="btn btn-outline-primary btn-sm mx-1">Add</button>
          </form>
        </div>

        <h2>Your ToDo:</h2>

        {total > 0 && (
          <div className="mb-3" style={{ maxWidth: '500px' }}>
            <div className="progress">
              <div 
                className="progress-bar bg-success" 
                style={{ width: `${Math.floor((completedCount * 100) / total)}%` }}
              >
                {completedCount}/{total}
              </div>
            </div>
          </div>
        )}

        <div className="mb-3">
          <Link to="/" className="btn btn-outline-secondary me-1">All</Link>
          <Link to="/?filter=completed" className="btn btn-outline-success me-1">Completed</Link>
          <Link to="/?filter=pending" className="btn btn-outline-warning me-1">Pending</Link>
          <Link to="/?filter=overdue" className="btn btn-outline-danger me-1">Overdue</Link>
        </div>

        {search && <p>Showing results for: <b>{search}</b></p>}

        {todos.length === 0 ? (
          <div className="alert alert-info" role="alert">
            {search ? `No results found for "${search}"` :
             filter === 'completed' ? 'No completed tasks yet' :
             filter === 'pending' ? 'No pending tasks' :
             filter === 'overdue' ? 'No overdue tasks 🎉' :
             'No Record found. Add your first ToDo now!'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle shadow-sm bg-white">
              <thead>
                <tr>
                  <th scope="col">SNo.</th>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Date</th>
                  <th scope="col">Deadline</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.map((todo, index) => (
                  <tr key={todo.sno}>
                    <th scope="row">{index + 1}</th>
                    <td>
                      <span className={todo.completed ? 'text-decoration-line-through text-muted' : ''}>
                        {todo.title}
                      </span>
                    </td>
                    <td>
                      <span className={todo.completed ? 'text-decoration-line-through text-muted' : ''}>
                        {todo.desc}
                      </span>
                    </td>
                    <td>{dayjs(todo.date_created).format('DD MMM YYYY, hh:mm A')}</td>
                    <td>
                      {todo.deadline ? dayjs(todo.deadline).format('DD MMM YYYY, hh:mm A') : 'No deadline'}
                    </td>
                    <td>
                      <button onClick={() => handleToggleComplete(todo.sno)} className="btn btn-outline-success btn-sm mx-1 mb-1">
                        {todo.completed ? 'Undo' : 'Done'}
                      </button>
                      <Link to={`/update/${todo.sno}`} className="btn btn-outline-primary btn-sm mx-1 mb-1">
                        Update
                      </Link>
                      <button onClick={() => handleDelete(todo.sno, todo.title)} className="btn btn-outline-danger btn-sm mx-1 mb-1">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="col-md-4">
        <div className="card shadow-sm p-4">
          <h5>Summary</h5>
          <p>Total: <b>{total}</b></p>
          <p>Completed: <b>{completedCount}</b></p>
          <p>Pending: <b>{total - completedCount}</b></p>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
