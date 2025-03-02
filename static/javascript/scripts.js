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
