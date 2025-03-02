console.log('Script carregado com sucesso!')

function toggleMenu() {
    console.log("Chamada de Toggled funcionando!")
    const navLinks = document.querySelector('#nav-links');
    navLinks.classList.toggle('active'); /* Adiciona ou remove a classe active*/
}
/* o modal */
var modal = document.getElementById('myModal');

//obter a imagem e inserir dentro do modal - usar texto do "alt" como legenda
var img = document.getElementById('company-img');
var modalImg = document.getElementById('img01');
var captionText = document.getElementById('caption');
img.onclick = function() {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
}
//obtenha o <span> que vai fechar o modal
var span = document.getElementsByClassName("close")[0];

//quando o usuário clicar no <span> (x), feche o modal
span.onclick = function() {
    modal.style.display = "none";
}

// apresentando mensagem de cadastro de produto realizado
function showMessage(event){
    event.preventDefault(); // evita que o formulário seja enviado imediatamente

    let messageDiv = document.getElementById("flash-message");
    messageDiv.textContent = "Cadastro realizado com sucesso!";
    messageDiv.style.display = "block";

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000); // esconde a mensagem após 3 minutos

    setTimeout(() => {
        event.target.form.submit() // envia o form após a mensagem desaparecer, depos de 1.5 segundos
    }, 1500);
}

// function que carrega o relatório de estoque e faz consultas na api a cada 5000 milisegundos
function loadStockReports(){
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
            id.textContent = item.id;

            let productName = document.createElement('td');
            productName.textContent = item.product_name;

            let amount = document.createElement('td');
            amount.textContent = item.amount;

            let cost = document.createElement('td');
            cost.textContent = item.average_cost;

            let sale = document.createElement('td');
            sale.textContent = item.average_sale;

            let date = document.createElement('td');
            date.textContent = item.date;
            console.log('Todas as células foram criadas com sucesso!');

            row.appendChild(id);
            row.appendChild(productName);
            row.appendChild(amount);
            row.appendChild(cost);
            row.appendChild(sale);
            row.appendChild(date);
            console.log('Células adicionadas a linha!');

            tbody.appendChild(row);
            console.log('Linha adicionada a tabela!');
        });
    })
    .catch(error => console.error('Erro ao carregar o relatório: ',error));
}

// essa funçao chama a funçao acima após o carregamento da página
window.onload = function() {
    if(window.location.pathname == "/reports") {
        loadStockReports();
    }
};