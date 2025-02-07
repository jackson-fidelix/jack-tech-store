from main import app
from flask import render_template


#routes
@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/sale")
def sale():
    return "Aba de Vendas"


@app.route("/buy")
def buy():
    return "Compras"