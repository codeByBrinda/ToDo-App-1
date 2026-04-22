from flask import Flask, request, jsonify 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime 

app = Flask(__name__)
CORS(app) # Enable CORS for frontend requests
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///ToDo.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class ToDo(db.Model):
    sno = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(200), nullable = False)
    desc = db.Column(db.String(500), nullable = False)
    completed = db.Column(db.Boolean, default=False)
    deadline = db.Column(db.DateTime, nullable=True)
    date_created = db.Column(db.DateTime, default= datetime.utcnow)

    def to_dict(self):
        return {
            'sno': self.sno,
            'title': self.title,
            'desc': self.desc,
            'completed': self.completed,
            'deadline': self.deadline.strftime("%Y-%m-%dT%H:%M") if self.deadline else None,
            'date_created': self.date_created.strftime("%Y-%m-%dT%H:%M:%S") if self.date_created else None
        }

@app.route("/api/todos", methods=['GET'])
def get_todos():
    search = request.args.get('search') 
    filter_type = request.args.get('filter')
    query = ToDo.query

    if search and search.strip() != "":
        query = query.filter(ToDo.title.ilike(f"%{search}%") | ToDo.desc.ilike(f"%{search}%"))
    
    if filter_type == "completed":
        query = query.filter_by(completed=True)
    elif filter_type == "pending":
        query = query.filter_by(completed=False)
    elif filter_type == "overdue":
        query = query.filter(ToDo.deadline != None, ToDo.deadline < datetime.utcnow(), ToDo.completed == False)
   
    alltodo = query.all()

    total = ToDo.query.count()
    completed = ToDo.query.filter_by(completed=True).count()

    return jsonify({
        'todos': [todo.to_dict() for todo in alltodo],
        'total': total,
        'completed': completed
    })

@app.route("/api/todos", methods=['POST'])
def add_todo():
    data = request.json
    title = data.get('title')
    desc = data.get('desc')
    deadline = data.get('deadline')
    
    deadline_obj = None
    if deadline:
        try:
            deadline_obj = datetime.strptime(deadline, "%Y-%m-%dT%H:%M")
        except ValueError:
            pass

    todo = ToDo(title=title, desc=desc, deadline=deadline_obj)
    db.session.add(todo)
    db.session.commit()
    
    return jsonify({'success': True, 'todo': todo.to_dict()})

@app.route("/api/todos/<int:sno>", methods=['DELETE'])
def delete_todo(sno):
    todo = ToDo.query.filter_by(sno=sno).first()
    if todo:
        db.session.delete(todo)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Todo not found'}), 404

@app.route("/api/todos/<int:sno>", methods=['PUT'])
def update_todo(sno):
    data = request.json
    todo = ToDo.query.filter_by(sno=sno).first()    
    if todo:
        todo.title = data.get('title', todo.title)
        todo.desc = data.get('desc', todo.desc)
        db.session.commit()
        return jsonify({'success': True, 'todo': todo.to_dict()})
    return jsonify({'success': False, 'error': 'Todo not found'}), 404

@app.route("/api/todos/<int:sno>/complete", methods=['PATCH'])
def complete_todo(sno):
    todo = ToDo.query.filter_by(sno=sno).first()
    if todo:
        todo.completed = not todo.completed   # toggle True/False
        db.session.commit()
        return jsonify({'success': True, 'completed': todo.completed})
    return jsonify({'success': False, 'error': 'Todo not found'}), 404

# Serve the old routes gracefully so we don't break "frontend backend connectivity" if the user accidentally navigates. 
# But ideally the frontend React app is where the user will be.
@app.route("/", methods=['GET'])
def index():
    return jsonify({"message": "Flask API running. Start the React development server to view the frontend."})

if __name__== "__main__":
    with app.app_context():
        db.create_all() 
    app.run(debug=True, port=8000)
