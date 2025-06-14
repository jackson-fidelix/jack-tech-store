from main import app
from database.models import db, register, buy, sale
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from datetime import datetime, timedelta
from sqlalchemy import text

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
    print(stock_report)

    return jsonify(stock_report)


@app.route('/deleteTr', methods=["POST"])
def delete_product():
    product_id = request.json.get('id') # pegou o ID do Produto do form recebido na chamada da function JS

    product = register.query.filter_by(id=product_id).first()

    if product:
        db.session.delete(product) # se o produto existe, delete ele
        db.session.commit()
        return jsonify({'success' : True, 'message' : f'Produto {product_id} removido com sucesso!'})
    else:
        return jsonify({'success' : False, 'message' : 'Produto não encontrado!'})


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

    if product and product.amount > 0:
        print('Produto encontrado!')
        new_sale = sale(
            id_register = product.id,
            product_name = sale_name,
            sale_value = sale_value,
            amount = sale_amount,
            net_profit = calculate_net_profit(product.average_cost_value, sale_value, sale_amount, product.id),
            net_margin = 0,
            sale_per_month = 0,
            sale_date = sale_date
        )
        db.session.add(new_sale)
        db.session.commit()
    
        venda_mensal = venda_mes(sale_name)
        new_sale.sale_per_month = venda_mensal 
        product.average_sale_amount  = venda_mensal
        print(new_sale.sale_per_month)
        product.amount -= sale_amount
        db.session.commit()

        net_margin = calculate_net_margin(product.id)
        new_sale.net_margin = net_margin
        db.session.commit()

        return redirect(url_for('homepage', _anchor='sell-form', success=1))
    else:
        print(f'O produto {sale_name} nao existe na table register ou está com o estoque zerado.')
        return redirect(url_for('homepage', _anchor='sell-form', error=1))


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


def calculate_net_profit(product_average_cost_value, product_sale_value, product_amount, product_id): # cálculo de lucro líquido
    print("DEBUG - Product ID:", product_id)
    
    if product_id:
        cost_value = product_average_cost_value
        sale_value = product_sale_value
        sale_amount = product_amount

        net_profit = (sale_value - cost_value) * sale_amount
        return net_profit
    else:
        return 0
    
    
def calculate_net_margin(product_id):
    query = text("""
        SELECT 
            r.id AS product_id,
            r.product_name AS product_name,
            r.average_cost_value AS cost_value,
            s.sale_value AS sale_value,
            s.amount AS amount,
            s.net_profit AS net_profit
        FROM register r
        JOIN sale s ON r.id = s.id_register
        WHERE r.id = :product_id    
    """)

    result = db.session.execute(query, {"product_id": product_id}).fetchone()
    print("DEBUG resut:", result)

    if result:
        net_profit = result.net_profit
        sale_value = result.sale_value
        amount = result.amount

        net_margin = (net_profit / (sale_value * amount)) * 100 # fórmula da margem líquida
        print(f'Net Margin:{net_margin}')
        return net_margin
    else:
        return 0


@app.route('/api/sale_report', methods=['GET'])
def get_sale_reports():
    items = sale.query.all() # consulta a tabela SALE e retorna TODOS os registros

    sale_report = []

    for item in items:
        sale_report.append({
            'id': item.id, 
            'id_register': item.id_register, 
            'name': item.product_name,
            'sale_value': item.sale_value,
            'net_profit': item.net_profit,
            'net_margin': item.net_margin,
            'monthy_sales': item.sale_per_month,
            'amount': item.amount,
            'date': item.sale_date.strftime("%Y-%m-%d") # ajustando a formatação da data
        })
    print(sale_report)

    return jsonify(sale_report)


@app.route('/deleteSale', methods=['POST'])
def deleteSale():

    product_id = request.json.get('id')

    item = sale.query.filter_by(id=product_id).first()
    print(item)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True, 'message': f'Produto {product_id} removido com sucesso!'})
    else:
        return jsonify({'success': False, 'message': 'Produto não encontrado!'})


@app.route('/api/buy_report', methods = ['GET'])
def get_buy_reports():

    items = buy.query.all() # consulta a tabela BUY e retorna TODOS os registros
    buy_reports = []

    for item in items:
        buy_reports.append({
            'id': item.id,
            'id_register': item.id_register,
            'name': item.product_name,
            'cost': item.cost_value,
            'amount': item.amount,
            'date': item.buy_date.strftime("%Y-%m-%d") # ajustando a formatação da data
        })
    print(buy_reports)
    
    return jsonify(buy_reports)


@app.route('/deleteBuy', methods=['POST'])
def deleteBuy():
    product_id = request.json.get('id')

    item = buy.query.filter_by(id=product_id).first()
    print(item)
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True, 'message': f'Produto {product_id} removido com sucesso!'})
    else:
        return jsonify({'success': False, 'message': 'Produto não encontrado!'})



