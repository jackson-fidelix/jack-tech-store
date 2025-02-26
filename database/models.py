from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy() #criando a instancia do BD

class Register(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    product_name = db.Column(db.String(100), nullable=False, unique=True)
    amount = db.Column(db.Integer,  nullable=False)
    average_cost_value = db.Column(db.Float, nullable=False)
    average_sale_value = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)