from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy() #criando a instancia do BD

class Register(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    product_name = db.Column(db.String(100), index=True, nullable=False, unique=True)
    amount = db.Column(db.Integer,  nullable=False)
    average_cost_value = db.Column(db.Float, nullable=False)
    average_sale_value = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

class Buy(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    id_resgister = db.Column(db.Integer, foreign_key=True, unique=True)
    product_name = db.Column(db.String(100),index=True, nullable=False, unique=True)
    cost_value = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    buy_date = db.Column(db.DateTime, nullable=False)
     