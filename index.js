const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3"); // FALTABA ESTO
const path = require("path");

const app = express();
const port = 3000;

// Conexión a la base de datos, ANTES de las rutas que la usan
const db = new Database("pedidos.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesa TEXT,
        productos TEXT,
        fecha TEXT
    )
`);

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.post("/pedido", function(req, res) {
    let mesa = req.body.mesa;
    let productos = JSON.stringify(req.body.productos);
    let fecha = new Date().toISOString();

    let insertar = db.prepare("INSERT INTO pedidos (mesa, productos, fecha) VALUES (?, ?, ?)");
    insertar.run(mesa, productos, fecha);

    console.log("Pedido guardado:", mesa, productos, fecha);
    res.send("Pedido recibido correctamente");
});

app.get("/pedidos", function(req, res) {
    let consulta = db.prepare("SELECT * FROM pedidos WHERE DATE(fecha) = DATE('now') ORDER BY estado DESC, id DESC");
    let pedidos = consulta.all();
    res.json(pedidos);
});

app.put("/pedido/:id", function(req, res) {
    let id = req.params.id;
    let fechaEntrega = new Date().toISOString();
    let actualizar = db.prepare("UPDATE pedidos SET estado = 'entregado', fecha_entrega = ? WHERE id = ?");
    let resultado = actualizar.run(fechaEntrega, id);
    console.log("Filas modificadas:", resultado.changes);
    res.send("Pedido actualizado");
});

app.put("/pedido/:id/pendiente", function(req, res) {
    let id = req.params.id;
    let actualizar = db.prepare("UPDATE pedidos SET estado = 'pendiente', fecha_entrega = NULL WHERE id = ?");
    let resultado = actualizar.run(id);
    console.log("Pedido vuelto a pendiente:", id, "- Filas modificadas:", resultado.changes);
    res.send("Pedido actualizado a pendiente");
});

// app.listen siempre al final, cuando todo lo demás ya está definido
app.listen(port, "0.0.0.0", function() {
    console.log("Servidor escuchando en http://localhost:" + port);
});