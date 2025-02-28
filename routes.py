from main import app
from database.models import db, register
from flask import Flask, render_template, request, redirect, url_for
from datetime import datetime


#routes
@app.route("/")
def homepage():
    return render_template("index.html")


@app.route("/reports")
def reportspage():
    return render_template("reports.html")


@app.route("/register", methods=["POST"])
def register_product():
    #recebendo os valor dos inputs/register form
    product_name = request.form.get("register_name")
    cost = request.form.get("register_cost")
    amount = request.form.get("register_amount")
    date = request.form.get("register_date")

    #convertendo os valores
    cost = float(cost) if cost else 0.0
    amount = int(amount) if amount else 0
    # se não vier data, usar a data e hora atual
    date_obj = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()

    #criando o objeto e salvando no banco
    novo = register(
        product_name=product_name,
        amount=amount,
        average_cost_value=cost,
        average_sale_value=0.0,
        date=date_obj
    )
    db.session.add(novo)
    db.session.commit()

    # primeira opção, faz reoload
    return redirect(url_for("homepage", _anchor="register-form"))
    # segunda opção, faz reoload e apresenta uma mensagem >> register
    # return render_template("index.html", mensagem="Cadastro realizado com Sucesso!")
