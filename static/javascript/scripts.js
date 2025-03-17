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


// essa funçao chama a funçao loadStockreports o carregamento da página
window.onload = function() {
    if(window.location.pathname == "/reports") {
        loadStockReports();
    }
};

// function que carrega o relatório de estoque e faz consultas na api a cada 5000 milisegundos
function loadStockReports(){
    console.log('Estamos dentro da API!')
    fetch('/api/stock_report') //aqui é feito a requisiçao para API que criamos no flask
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos da API:', data);
        let tbody = document.getElementById('reports-tbody'); // selecionando o corpo da table
        tbody.innerHTML = '';

        // iterando sobre os dados retornados da API e criando as linhas da tabela
        data.forEach(item => {
            let row = document.createElement('tr');
            console.log('Linha criada com sucesso!'); // isso será apagado

            // para cada item cria uma célula que vai ficar dentro da linha criada
            let id = document.createElement('td');
            id.classList.add('tdBorder');
            id.textContent = item.id;

            let productName = document.createElement('td');
            productName.classList.add('tdBorder');
            productName.textContent = item.product_name;

            let amount = document.createElement('td');
            amount.classList.add('tdBorder');
            amount.textContent = item.amount;

            let cost = document.createElement('td');
            cost.classList.add('tdBorder');
            cost.textContent = `R$ ${item.average_cost.toFixed(2).replace('.',',')}`;

            let sale = document.createElement('td');
            sale.classList.add('tdBorder');
            sale.textContent = item.average_sale;

            let date = document.createElement('td');
            date.classList.add('tdBorder');
            date.textContent = item.date;

            let deleteButtonCell = document.createElement('td');
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = function() {
                console.log(`Produto ${item.id} marcado para deletar`);
                if (confirm('Tem certeza que deseja excluir esse produto?')) {
                    
                    let form = document.createElement('form');
                    form.method = 'POST'; // usando post para enviar o form para o Flask, pois o HTML nao suporta o DELETE
                    form.action = '/deleteTr';

                    let productId = document.createElement('input');
                    productId.type = 'hidden'; 
                    productId.name = 'id';
                    productId.value = item.id;

                    form.appendChild(productId);

                    document.body.appendChild(form);
                    form.submit();
                };

            };

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
};


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
