from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy() #criando a instancia do BD

class register(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    product_name = db.Column(db.String(100), index=True, nullable=False, unique=True)
    amount = db.Column(db.Integer,  nullable=False)
    average_cost_value = db.Column(db.Float, nullable=False)
    average_sale_amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

class buy(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    id_register = db.Column(db.Integer, db.ForeignKey('register.id'), nullable=False)
    product_name = db.Column(db.String(100),index=True, nullable=False)
    cost_value = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    buy_date = db.Column(db.DateTime, nullable=False)

    #criando a relação para acessar os dados
    product = db.relationship('register', backref=db.backref('purchases', lazy=True))

class sale(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    id_register = db.Column(db.Integer, db.ForeignKey('register.id'), nullable=False)
    product_name = db.Column(db.String(100), index=True, nullable=False)
    sale_value = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    sale_date = db.Column(db.DateTime, nullable=False)
