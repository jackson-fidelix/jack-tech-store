from main import app
from database.models import db, register, buy, sale
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from datetime import datetime, timedelta

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
    existing_product = register.query.filter_by(product_name=product_name).first()
    if existing_product:
        return redirect(url_for("homepage", _anchor="register-form", error=1))
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
        average_sale_amount=0,
        date=date_obj
    )
    db.session.add(novo)
    db.session.commit()

    # Redirecionando para a página inicial, com ancoragem no formulário
    return redirect(url_for("homepage", _anchor="register-form", success=1))


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
    print(f"Custo: {cost:.2f}")
    print(f"Quantidade: {amount}")
    print(f"Data: {date}")


    # verificando se o produto existe | first serve para retornar o primeiro registo encontrado
    product = register.query.filter(db.func.lower(register.product_name) == buy_product_name.lower()).first()

    print(product)
    if not product:
        print("Produto não encontrado!")
        return redirect(url_for("homepage", _anchor="buy-form", error=1))

    new_buy = buy(
        id_register = product.id, # chave estrangeira do produto 
        product_name = buy_product_name,
        cost_value = cost,
        amount = amount,
        buy_date = date
    )
    db.session.add(new_buy)
    db.session.commit()

    product.average_cost_value = ((product.amount * product.average_cost_value) + (amount * cost)) / (product.amount + amount)
    product.amount += amount
    db.session.commit()

    return redirect(url_for("homepage", _anchor="buy-form", success=1))


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
            'average_sale': product.average_sale_amount,
            'date': product.date.strftime("%Y-%m-%d ")  # Formatação da data
        })

    return jsonify(stock_report)


@app.route('/deleteTr', methods=["POST"])
def delete_product():
    product_id = request.form.get('id') # pegou o ID do Produto do form recebido na chamada da function JS

    product = register.query.filter_by(id=product_id).first()

    if product:
        db.session.delete(product) # se o produto existe, delete ele
        db.session.commit()
        print(f'Produto {product_id} excluido com sucesso.')
    else:
        print(f'Prduto {product_id} nao encontrado!')
    
    return redirect(url_for("reportspage"))


@app.route('/sale', methods=["POST"])
def sale_product():
    sale_name = request.form.get("sale_name").strip().lower()
    sale_value = request.form.get("sale_value")
    sale_amount = request.form.get("sale_amount")
    sale_date = request.form.get("sale_date")

    # convertendo os valores
    sale_value = float(sale_value) if sale_value else 0.00
    sale_amount = int(sale_amount) if sale_amount else 0
    sale_date = datetime.strptime(sale_date, "%Y-%m-%d") if sale_date else datetime.now()

    print(f"Nome do produto: {sale_name}")
    print(f"Valor: {sale_value}")
    print(f"Quantidade: {sale_amount}")
    print(f"Data: {sale_date}")

    product = register.query.filter(db.func.lower(register.product_name) == sale_name.lower()).first()

    if product:
        print('Produto encontrado!')
        new_sale = sale(
            id_register = product.id,
            product_name = sale_name,
            sale_value = sale_value,
            amount = sale_amount,
            sale_date = sale_date
        )
        db.session.add(new_sale)
        db.session.commit()
    
        venda_mensal = venda_mes(sale_name)
        product.average_sale_amount = venda_mensal
        product.amount -= sale_amount
        db.session.commit()

        return redirect(url_for('homepage', _anchor='sell-form'))
    else:
        print(f'O produto {sale_name} nao existe na table register.')
        return redirect(url_for("reportspage"))


def venda_mes(sale_name):
    date_atual = datetime.now()
    data_maxima = timedelta(days=30)
    periodo = date_atual - data_maxima

    vendas = sale.query.filter(
        db.func.lower(sale.product_name) == sale_name.lower(),
        sale.sale_date >= periodo).all()
    
    quantidade_mes = 0

    for venda in vendas:
        quantidade_mes += int(venda.amount)
    print(f'Foi vendido {quantidade_mes} itens.')
    return quantidade_mes        
