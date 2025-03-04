from main import app
from database.models import db, register, buy
from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime

# Rotas

@app.route("/")
def homepage():
    """
    Rota principal da aplicação, que renderiza a página inicial.

    Retorna:
    - HTML: A página inicial 'index.html'.
    """
    return render_template("index.html")


@app.route("/reports")
def reportspage():
    """
    Rota que renderiza a página de relatórios.

    Retorna:
    - HTML: A página de relatórios 'reports.html'.
    """
    return render_template("reports.html")


@app.route("/register", methods=["POST"])
def register_product():
    """
    Rota que recebe o formulário de cadastro de produto e registra os dados no banco.

    Parâmetros (via formulário POST):
    - 'register_name' (str): Nome do produto.
    - 'register_cost' (float): Custo do produto.
    - 'register_amount' (int): Quantidade do produto.
    - 'register_date' (str): Data do cadastro.

    Processa os dados recebidos, converte os tipos e salva um novo registro no banco de dados.

    Retorna:
    - Redirecionamento para a página inicial (com ancoragem no formulário).
    """
    # Recebendo os valores do formulário de cadastro
    product_name = request.form.get("register_name").strip().lower()
    cost = request.form.get("register_cost")
    amount = request.form.get("register_amount")
    date = request.form.get("register_date")

    # Convertendo os valores
    cost = float(cost) if cost else 0.00
    amount = int(amount) if amount else 0
    # Se não houver data, usa a data e hora atual
    date_obj = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()

    # Criando o objeto e salvando no banco
    novo = register(
        product_name=product_name,
        amount=amount,
        average_cost_value=cost,
        average_sale_value=0.0,
        date=date_obj
    )
    db.session.add(novo)
    db.session.commit()

    # Redirecionando para a página inicial, com ancoragem no formulário
    return redirect(url_for("homepage", _anchor="register-form"))


@app.route("/buy", methods=["POST"])
def buy_product():
    buy_product_name = request.form.get("buy_name").strip().lower()
    cost = request.form.get("buy_cost")
    amount = request.form.get("buy_amount")
    date = request.form.get("buy_date")

    #convertendo os valores
    cost = float(cost) if cost else 0.00
    amount = int(amount) if amount else 0
    date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
    
    print(f"Nome do produto: {buy_product_name}")
    print(f"Custo: {cost}")
    print(f"Quantidade: {amount}")
    print(f"Data: {date}")


    # verificando se o produto existe | first serve para retornar o primeiro registo encontrado
    product = register.query.filter(db.func.lower(register.product_name) == buy_product_name.lower()).first()

    print(product)
    if not product:
        return jsonify({"error": "Produto não encontrado"}), 404
    

    new_buy = buy(
        id_register = product.id, # chave estrangeira do produto 
        product_name = buy_product_name,
        cost_value = cost,
        amount = amount,
        buy_date = date
    )
    db.session.add(new_buy)
    db.session.commit()

    return redirect(url_for("homepage", _anchor="buy-form"))


@app.route('/api/stock_report', methods=['GET'])
def get_stock_report():
    """
    Rota da API que retorna o relatório de estoque em formato JSON.

    Retorna:
    - JSON: Uma lista de produtos com informações sobre nome, quantidade, custo médio, 
      preço de venda médio(mês) e data de cadastro.
    
    Exemplo de resposta:
    [
        {
            "id": 1,
            "product_name": "Produto A",
            "amount": 10,
            "average_cost": 20.5,
            "average_sale": 30.0,
            "date": "2025-03-03"
        },
        ...
    ]
    """
    products = register.query.all()  # Consulta a tabela de registros e retorna todos os produtos

    stock_report = []  # Lista vazia que armazenará os dados de cada produto

    # Iterando sobre os produtos
    for product in products:
        stock_report.append({
            'id': product.id,
            'product_name': product.product_name.capitalize(),
            'amount': product.amount,
            'average_cost': product.average_cost_value,
            'average_sale': product.average_sale_value,
            'date': product.date.strftime("%Y-%m-%d ")  # Formatação da data
        })

    return jsonify(stock_report)
