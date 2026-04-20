from flask import Flask, render_template, request, redirect 
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime 

app = Flask(__name__)
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

    def __repr__(self):
        return f'{self.sno}-{self.title}'

@app.route("/", methods = ['GET', 'POST'])
def hello_world():
    if request.method == 'POST':
        title = request.form['title']
        desc = request.form['desc']

        deadline = request.form.get('deadline')
        deadline_obj = None
        if deadline:
            deadline_obj = datetime.strptime(deadline, "%Y-%m-%dT%H:%M")

        todo = ToDo(title = title, desc = desc, deadline=deadline_obj)
        db.session.add(todo)
        db.session.commit()

        return redirect("/") # prevents duplicate insert 
    
    search = request.args.get('search') 
    filter_type = request.args.get('filter')
    query = ToDo.query

    if search and search.strip() != "":
        query = query.filter(ToDo.title.ilike(f"%{search}%")  | ToDo.desc.ilike(f"%{search}%"))
    
    if filter_type == "completed":
        query = query.filter_by(completed=True)
    elif filter_type == "pending":
        query = query.filter_by(completed=False)
    elif filter_type == "overdue":
        query = query.filter(ToDo.deadline != None, ToDo.deadline < datetime.utcnow(), ToDo.completed == False)
   
    alltodo = query.all()

    total = ToDo.query.count()
    completed = ToDo.query.filter_by(completed=True).count()

    return render_template('index.html',alltodo=alltodo, now=datetime.utcnow(), total=total, completed=completed)

@app.route("/Delete/<int:sno>")
def Delete(sno):
    todo = ToDo.query.filter_by(sno=sno).first()
    db.session.delete(todo)
    db.session.commit()
    return redirect("/")

@app.route("/Update/<int:sno>", methods = ['GET', 'POST'])
def Update(sno):
    if request.method == 'POST':
        title = request.form['title']
        desc = request.form['desc']
        todo = ToDo.query.filter_by(sno=sno).first()    
        todo.title = title
        todo.desc = desc
        db.session.add(todo)
        db.session.commit()
        return redirect("/")

    todo = ToDo.query.filter_by(sno=sno).first()
    return render_template('update.html', todo=todo)

@app.route("/complete/<int:sno>")
def complete(sno):
    todo = ToDo.query.filter_by(sno=sno).first()
    todo.completed = not todo.completed   # toggle True/False
    db.session.commit()
    return redirect("/")


if __name__== "__main__":
    with app.app_context():
        db.create_all() 
    app.run(debug = True, port= 8000)
