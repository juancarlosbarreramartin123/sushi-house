let params = new URLSearchParams(window.location.search);
let mesa = params.get("mesa");

function addProduct(productId) {
    let quantity = document.getElementById(productId);
    quantity.textContent = Number(quantity.textContent) + 1;
    getTotalQuantity()

    console.log("He ejecutado getTotalQuantity")
}

function removeProduct(productId)  {
    let quantity = document.getElementById(productId);
    let currentQuantity = Number(quantity.textContent);
   if ( currentQuantity  > 0) {
    quantity.textContent = currentQuantity - 1;
    getTotalQuantity()
   }
  
}

function getTotalQuantity() {
    let quantities = document.querySelectorAll(".quantity");
    let total = 0;
    let order = "";

    quantities.forEach(function(quantity) {
        let amount = Number(quantity.textContent);
        total = total + amount;

        if(amount>0) {
            let name = quantity.dataset.name;
            order = order + "<p>" + amount + " x " + "" + name + "</p>"
        }
    });

    let confirmButton = ""
        if(total > 0) {
            confirmButton =  "<button id='confirm-button' class='confirm-button' onclick='showModal()'>Confirmar pedido</button>";
        }
        
 console.log(total);
    document.getElementById("total").textContent = total;
    document.getElementById("cart-list").innerHTML = order;
    document.getElementById("cart-footer").innerHTML = confirmButton;
}

function toggleCart() {
    let cartContent = document.getElementById("cart-content");
    if(cartContent.style.display === "none") {
        cartContent.style.display = "flex";
    } else {
        cartContent.style.display = "none";
    }
}

function showModal() {
    let cartContent = document.getElementById("cart-content");
    let modal = document.getElementById("order-modal");

    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-box">
                <h2>Resumen de tu pedido</h2>

                <div class="modal-order">
                    ${document.getElementById("cart-list").innerHTML}
                </div>

                <p>Total de productos: ${document.getElementById("total").textContent}</p>

                <button onclick="sendOrder()">Enviar pedido</button>
                <button onclick="closeModal()">Volver atrás</button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
    cartContent.style.display = "none";
}

function closeModal() {
    document.getElementById("order-modal").style.display = "none";
}

function sendOrder() {
    let quantities = document.querySelectorAll(".quantity");
    let productos = [];

    quantities.forEach(function(quantity) {
        let amount = Number(quantity.textContent);
        if(amount>0) {
            productos.push(amount + "x" + quantity.dataset.name);
        }
    });

    fetch("/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({mesa: mesa, productos: productos})

    });

    let modal = document.getElementById("order-modal");
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-box">
                <h2>Su pedido ha sido enviado</h2>
                 <div class="progress-container">
                  <div class="progress-bar" id="progress-bar"></div>
                 </div>
            </div>
        </div>
    `;

    quantities.forEach(function(quantity) {
        quantity.textContent = "0";
    });
    getTotalQuantity();

    setTimeout(closeModal, 3000);
    setTimeout(function() {
    document.getElementById("progress-bar").style.width = "100%";
}, 10);
}