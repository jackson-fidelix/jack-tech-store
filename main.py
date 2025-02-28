from flask import Flask
from database.models import db, register, buy, sale
from routes import *

app = Flask(__name__)

# Configuraçao do banco
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///estoque.db'
# desativa um recurso do Flask-SQLAlchemy que monitora todas as alterações feitas nos objetos do banco de dados.
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa o SQLAlchemy com este app
db.init_app(app)

if __name__ == "__main__":
    # Cria as tabelas dentro do contexto do app
    with app.app_context():
        db.create_all()
        # baixar DB Browser for SQLite (Windows, Mac, Linux) para ver a instancia
    app.run()
