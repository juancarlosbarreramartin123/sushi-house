let cantidadAnterior = null;

function cargarPedidos() {
    fetch("/pedidos")
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(pedidos) {
            let cuerpoTabla = document.getElementById("cuerpo-tabla");
            cuerpoTabla.innerHTML = "";

            pedidos.forEach(function(pedido) {
                let productos = JSON.parse(pedido.productos);
                let tiempo = calcularTiempoEspera(pedido);

                let inicio = new Date(pedido.fecha);
                let ahora = new Date();
                let minutosDesdeCreado = (ahora - inicio) / 1000 / 60;

                let claseFila = "";
                if (pedido.estado === "pendiente") {
                    if (minutosDesdeCreado < 5) {
                        claseFila = "tiempo-verde";
                    } else if (minutosDesdeCreado < 10) {
                        claseFila = "tiempo-naranja";
                    } else {
                        claseFila = "tiempo-rojo";
                    }
                }

                let boton;
                if (pedido.estado === "pendiente") {
                    boton = "<button onclick='cambiarEstado(" + pedido.id + ")'>Marcar entregado</button>";
                } else {
                    boton = "<button onclick='deshacerEstado(" + pedido.id + ")'>Deshacer</button>";
                }

                let fila = "<tr class='" + claseFila + "'><td>" + pedido.mesa + "</td><td>" + productos.join(", ") + "</td><td>" + tiempo + "</td><td>" + pedido.estado + "</td><td>" + boton + "</td></tr>";
                cuerpoTabla.innerHTML += fila;
            });
        });
}

function calcularTiempoEspera(pedido) {
    let inicio = new Date(pedido.fecha);
    let fin;

    if (pedido.estado === "entregado") {
        fin = new Date(pedido.fecha_entrega);
    } else {
        fin = new Date();
    }

    let segundos = Math.floor((fin - inicio) / 1000);
    let minutos = Math.floor(segundos / 60);
    segundos = segundos % 60;

    return minutos + "m " + segundos + "s";
}

function cambiarEstado(id) {
    fetch("/pedido/" + id, {
        method: "PUT"
    }).then(function() {
        cargarPedidos();
    });
}

function deshacerEstado(id) {
    fetch("/pedido/" + id + "/pendiente", {
        method: "PUT"
    }).then(function() {
        cargarPedidos();
    });
}

cargarPedidos();
setInterval(function() {
    cargarPedidos();
}, 5000);