console.log('Script carregado com sucesso!')

function toggleMenu() {
    console.log("Chamada de Toggled funcionando!")
    const navLinks = document.querySelector('#nav-links');
    navLinks.classList.toggle('active'); /* Adiciona ou remove a classe active*/
}

/* essa funçao chama a funçao modal quando estiver na página index
vale ressaltar que o uso do "DOMContentLoaded" é importante para que
esse conteúdo rode depois de todo o HTML ter sido carregado */

document.addEventListener("DOMContentLoaded", function(){
    if (window.location.pathname == "/") {
        var modal = document.getElementById('myModal');
        var img = document.getElementById('company-img');
        var modalImg = document.getElementById('img01');
        var captionText = document.getElementById('caption');
        // obtenha o <span> que vai fechar o modal
        var span = document.getElementsByClassName("close")[0];

        if (modal && img && modalImg && captionText && span) {
            img.addEventListener("click", function() {
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
            });

            // quando o usuário clicar no <span> (x), feche o modal
            span.addEventListener("click", function(){
                modal.style.display = "none";
            });
        } else {
            console.log('Erro: Um ou mais elementos do modal nao foram encontrados. ');
        }
    }
});


document.addEventListener("DOMContentLoaded", function() {
    let params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        showMessage("Produto já tem cadastro!", "red");
    } else if (params.has("success")) {
        showMessage("Cadastro realizado com sucesso!", "green");
    }
});

// apresentando mensagem de cadastro de produto realizado, similar a funçoes no python
function showMessage(message, color) {
    let messageDiv = document.getElementById("flash-message");
    
    if (!messageDiv) return; 
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor =  color;
    messageDiv.style.display = "block";

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000); // esconde a mensagem após 3 minutos
}


/* essa funçao chama a funçao loadStockreports o carregamento da página
window.onload = function() {
    if(window.location.pathname == "/reports") {
        loadStockReports();
    }
};
*/

// function que carrega o relatório de estoque e faz consultas na api a cada 5000 milisegundos
function loadReport(){
    let selectValue = document.getElementById('choose-reports').value;

    if (!selectValue) {
        console.warn('Nenhum relatório selecionado.');
        return
    }

    let table = document.getElementById('reports-table');
    // remove as classes, para não replicar na outra tabela
    table.classList.remove("stock-table", "sale-table", "buy-table");
    let apiUrl = '';

    if (selectValue == 'stock') {
        apiUrl = '/api/stock_report';
        console.log('Estamos dentro da Stock API !')
        fetch(apiUrl) // Fazendo a requisição para a API correpondente
        .then(response => response.json()) // Converte a resposta para JSON
        .then(data => { // aqui vamos manipular o resultado do JSON no caso data(seria os valores)
            console.log('Dados recebidos da API e convertidos para JSON:', data);

            table.classList.add('stock-table');

            let titleTable = document.getElementById('title-tables');
            titleTable.innerHTML = ''
            titleTable.textContent = 'Relatório de Estoque';
            titleTable.style.backgroundColor = 'var(--third-verdeMilitar)';
            titleTable.style.color = 'var(--fourth-loboDaMadeira)';

            let tbody = document.getElementById('reports-tbody'); // selecionando o corpo da table
            tbody.innerHTML = '';

            let tHead = document.getElementById('reports-head');
            tHead.innerHTML = '';

            let rowHead = document.createElement('tr');
            console.log("Criando cabeçalho da tabela Estoque.");

            let idHead = document.createElement('th');
            idHead.classList.add('th-stock');
            idHead.textContent = 'ID';

            let nameHead = document.createElement('th');
            nameHead.classList.add('th-stock');
            nameHead.textContent = 'Product Name';

            let amountHead = document.createElement('th');
            amountHead.classList.add('th-stock');
            amountHead.textContent = 'Amount';

            let averageCostHead = document.createElement('th');
            averageCostHead.classList.add('th-stock');
            averageCostHead.textContent = 'Average Cost';

            let averageSaleHead = document.createElement('th');
            averageSaleHead.classList.add('th-stock');
            averageSaleHead.textContent = 'Average Sale - Month';

            let dateHead = document.createElement('th');
            dateHead.classList.add('th-stock');
            dateHead.textContent = 'Register Date';

            // preciso fazer o append desses dados na linha criada rowHead
            rowHead.appendChild(idHead);
            rowHead.appendChild(nameHead);
            rowHead.appendChild(amountHead);
            rowHead.appendChild(averageCostHead);
            rowHead.appendChild(averageSaleHead);
            rowHead.appendChild(dateHead);

            tHead.append(rowHead);
            console.log('Título da tabela Estoque adicionado!')

            // iterando sobre os dados retornados da API e criando as linhas da tabela
            data.forEach(item => {
                let row = document.createElement('tr');
                console.log('Linha criada com sucesso!'); // isso será apagado

                // para cada item cria uma célula que vai ficar dentro da linha criada
                let id = document.createElement('td');
                id.classList.add('td-stock');
                id.textContent = item["id"];

                let productName = document.createElement('td');
                productName.classList.add('td-stock');
                productName.textContent = item["product_name"];

                let amount = document.createElement('td');
                amount.classList.add('td-stock');
                amount.textContent = item["amount"];

                let cost = document.createElement('td');
                cost.classList.add('td-stock');
                cost.textContent = `R$ ${item["average_cost"].toFixed(2).replace('.',',')}`;

                let sale = document.createElement('td');
                sale.classList.add('td-stock');
                sale.textContent = item["average_sale"];

                let date = document.createElement('td');
                date.classList.add('td-stock');
                date.textContent = item["date"];

                let deleteButtonCell = document.createElement('td');
                let deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteButton.classList.add('delete-button');
                deleteButton.onclick = function() {
                    console.log(`Produto ${item["id"]} marcado para deletar`);
                    confirm(`Tem certeza que deseja excluir ${item["product_name"]}?`)

                    fetch('/deleteTr', {
                        method: 'POST', 
                        headers: {
                            'Content-Type' : 'application/json'
                        },
                        body: JSON.stringify({id: item["id"]})
                    })
                    .then(response => response.json())
                    .then(result => {
                        if(result.success){
                        alert(result.message);
                        loadCurrentReport()
                        }else {
                            alert("Erro ao deletar: " + result.message);
                        }
                    })
                    .catch(error => {
                        console.error('Erro na exclusão ', error);
                    });               
                }

                deleteButtonCell.appendChild(deleteButton);

                console.log('Todas as células foram criadas com sucesso!');

                row.appendChild(id);
                row.appendChild(productName);
                row.appendChild(amount);
                row.appendChild(cost);
                row.appendChild(sale);
                row.appendChild(date);
                row.appendChild(deleteButtonCell);
                console.log('Células adicionadas a linha!');

                tbody.appendChild(row);
                console.log('Linha adicionada a tabela!');
            });
        })
        .catch(error => console.error('Erro ao carregar o relatório: ',error));
    } else if (selectValue == 'sale') {
        apiUrl = '/api/sale_report';
        console.log('Estamos dentro da Sale API!')
            fetch(apiUrl) // requisição para a API sale
            .then(response => response.json()) // tranforma a response, que seria resposta em json
            .then(data => {
                console.log('Recebemos os dados e convertemos para JSON: ', data);

                table.classList.add('sale-table');

                let titleTable = document.getElementById('title-tables');
                titleTable.innerHTML = '';
                titleTable.textContent = 'Relatório de Vendas';
                titleTable.style.backgroundColor = 'var(--fourth-loboDaMadeira)';
                titleTable.style.color = 'var(--third-verdeMilitar)';

                let tHead = document.getElementById('reports-head');
                tHead.innerHTML = '';

                let rowHead = document.createElement('tr');
                console.log('Criando o cabeçalho da tabela VENDA.');

                let idHead = document.createElement('th');
                idHead.classList.add('th-sale');
                idHead.textContent = "ID";

                let nameHead = document.createElement('th');
                nameHead.classList.add('th-sale');
                nameHead.textContent = "Product Name";

                let amountHead = document.createElement('th');
                amountHead.classList.add('th-sale');
                amountHead.textContent = 'Amount';

                let saleHead = document.createElement('th');
                saleHead.classList.add('th-sale');
                saleHead.textContent = 'Sale';

                let netProfitHead = document.createElement('th');
                netProfitHead.classList.add('th-sale');
                netProfitHead.textContent = 'Net Profit';

                let netMarginHead = document.createElement('th');
                netMarginHead.classList.add('th-sale');
                netMarginHead.textContent = 'Net Margin';

                let dateHead = document.createElement('th');
                dateHead.classList.add('th-sale');
                dateHead.textContent = 'Date';

                let monthlySalesHead = document.createElement('th');
                monthlySalesHead.classList.add('th-sale');
                monthlySalesHead.textContent = 'Monthly Sales';

                rowHead.appendChild(idHead);
                rowHead.appendChild(nameHead);
                rowHead.appendChild(amountHead);
                rowHead.appendChild(saleHead);
                rowHead.appendChild(netProfitHead);
                rowHead.appendChild(netMarginHead);
                rowHead.appendChild(dateHead);
                rowHead.appendChild(monthlySalesHead);

                tHead.appendChild(rowHead);

                let tBody = document.getElementById('reports-tbody');
                tBody.innerHTML = '';
                data.forEach(item => {
                    let row = document.createElement('tr');

                    let id = document.createElement('td');
                    id.classList.add('td-sale');
                    id.textContent = item["id"];

                    let product = document.createElement('td');
                    product.classList.add('td-sale');
                    product.textContent = item["name"];

                    let amount = document.createElement('td');
                    amount.classList.add('td-sale');
                    amount.textContent = item["amount"];

                    let sale = document.createElement('td');
                    sale.classList.add('td-sale');
                    sale.textContent = `R$ ${item["sale_value"].toFixed(2).replace('.',',')}`;

                    let netProfit = document.createElement('td');
                    netProfit.classList.add('td-sale');
                    netProfit.textContent = `R$ ${item["net_profit"].toFixed(2).replace('.',',')}`;
                    
                    let netMargin = document.createElement('td');
                    netMargin.classList.add('td-sale');
                    netMargin.textContent = `${item["net_margin"].toFixed(2).replace('.', ',')}%`;

                    let date = document.createElement('td');
                    date.classList.add('td-sale');
                    date.textContent = item["date"];

                    let monthlySales = document.createElement('td');
                    monthlySales.classList.add('td-sale');
                    monthlySales.textContent = item["monthy_sales"];
                    
                    let btnDelete = document.createElement('button');
                    btnDelete.classList.add('delete-button')
                    btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    btnDelete.onclick = function() {
                        console.log(`O produto ${item["id"]} foi marcado para ser removido.`);
                        confirm(`Tem certeza que deseja remover ${item["name"]}?`);
                        

                        fetch('/deleteSale', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({id: item["id"]})
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                alert(result.message);
                                loadCurrentReport();            
                            } else {
                                alert("Erro ao deletar: " + result.message);
                            }
                        })
                        .catch(error => {
                            console.error("Erro na exclusão:", error);
                        });
                    }

                    row.appendChild(id);
                    row.appendChild(product);
                    row.appendChild(amount);
                    row.appendChild(sale);
                    row.appendChild(netProfit);
                    row.appendChild(netMargin);
                    row.appendChild(date);
                    row.appendChild(monthlySales);
                    row.appendChild(btnDelete);

                    tBody.appendChild(row);
                })
                
            })
    } else if (selectValue == 'buy') {
        apiUrl = '/api/buy_report';
        console.log('Estamos dentro da Buy API.')
            fetch(apiUrl) // requisição os dados da API
            .then(response => response.json()) // transformando em JSON
            .then(data => {
                console.log('Recebemos os dados e convertemos para JSON: ', data);

                let titleTableBuy = document.getElementById('title-tables');
                titleTableBuy.innerHTML = '';
                titleTableBuy.textContent = 'Compra de Mercadorias';
                titleTableBuy.style.backgroundColor = 'var(--primary-purpuraDeTiro)';
                titleTableBuy.style.color = 'var(--fifth-laranjaClaro)';

                table.classList.add('buy-table');

                let tHead = document.getElementById('reports-head');
                tHead.innerHTML = '';

                let rowHead = document.createElement('tr');
                console.log('Criada a linha do BUY HEAD.');

                let id = document.createElement('th');
                id.classList.add('th-buy');
                id.textContent = 'ID';

                let productName = document.createElement('th');
                productName.classList.add('th-buy');
                productName.textContent = 'Product Name';

                let costValue = document.createElement('th');
                costValue.classList.add('th-buy');
                costValue.textContent = 'Cost Value';

                let amount = document.createElement('th');
                amount.classList.add('th-buy');
                amount.textContent = 'Amount';

                let buyDate = document.createElement('th');
                buyDate.classList.add('th-buy');
                buyDate.textContent = 'Buy Date';
                
                rowHead.appendChild(id);
                rowHead.appendChild(productName);
                rowHead.appendChild(costValue);
                rowHead.appendChild(amount);
                rowHead.appendChild(buyDate);

                tHead.appendChild(rowHead);

                let tBody = document.getElementById('reports-tbody');
                tBody.innerHTML = '';
                data.forEach(item => {

                    let rowBuy = document.createElement('tr');

                    let idProduct = document.createElement('td');
                    idProduct.classList.add('td-buy');
                    idProduct.textContent = item["id"];

                    let productName = document.createElement('td');
                    productName.classList.add('td-buy');
                    productName.textContent = item["name"];

                    let costValue = document.createElement('td');
                    costValue.classList.add('td-buy');
                    costValue.textContent = `R$ ${item["cost"].toFixed(2).replace('.',',')}`;

                    let amountBuy = document.createElement('td');
                    amountBuy.classList.add('td-buy');
                    amountBuy.textContent = item["amount"];

                    let buyDate = document.createElement('td');
                    buyDate.classList.add('td-buy');
                    buyDate.textContent = item["date"];

                    let btnDelete = document.createElement('button');
                    btnDelete.classList.add('delete-button');
                    btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>'
                    btnDelete.onclick = function(){
                        console.log(`O produto ${item["name"]} foi marcado para ser removido.`);
                        confirm(`Tem certeza que deseja remover ${item["name"]}?`);

                        fetch('/deleteBuy', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({id: item["id"]})
                        })
                        .then(response => response.json())
                        .then(result => {
                            if(result.success) {
                                alert(result.message);
                                loadCurrentReport(); 
                            } else {
                                alert("Erro ao deletar:" + result.message);
                            }
                        })
                        .catch(error => {
                            console.error("Erro na exclusão: ", error);
                        });
                    }

                    rowBuy.appendChild(idProduct);
                    rowBuy.appendChild(productName);
                    rowBuy.appendChild(costValue);
                    rowBuy.appendChild(amountBuy);
                    rowBuy.appendChild(buyDate);
                    rowBuy.appendChild(btnDelete);

                    tBody.appendChild(rowBuy);
                })

            })
    } else {
        console.log('Opção Inválida!');
        return;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let param = new URLSearchParams(window.location.search);

    if (param.has("error")) {
        showBuy("Produto não encontrado!", "red");
    } else if (param.has("success")) {
        showBuy("Compra realizada com sucesso!", "green");
    }
});

function showBuy(messageBuy, colorBuy) {
    let message = document.getElementById("flash-buymsg");

    message.textContent = messageBuy;
    message.style.backgroundColor = colorBuy;
    message.style.display = "block";

    setTimeout(() => {
        message.style.display = "none";
    }, 3000); // esconde a mensagem após 3 minutos
}
    

document.addEventListener("DOMContentLoaded", function() {
    let params = new URLSearchParams(window.location.search);

    if (params.has("error")) {
        showSale("Produto não encontrado ou com estoque zerado!", "red");
    } else if(params.has("success")) {
        showSale("Venda realizada com sucesso!", "green");
    }
});

function showSale(message, color) {
    let msg = document.getElementById("flash-sale-msg");

    if (!msg) return;
    msg.textContent = message;
    msg.style.backgroundColor = color;
    msg.style.display = "block";

    setTimeout(() => {
        msg.style.display = "none";
    }, 3000); // esconde a mensagem após 3 minutos
}

function loadCurrentReport() {
    const selecValue = document.getElementById('choose-reports').value;
    if (selecValue === 'stock') {
        loadReport('/api/stock_report');
    } else if (selecValue === 'sale') {
        let tableBody = document.getElementById('reports-tbody');
        tableBody.innerHTML = '';
        loadReport('/api/sale_report');
    } else if (selecValue === 'buy') {
        loadReport('/api/buy_report');
    }
}