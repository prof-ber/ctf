const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "chat_app",
});

db.connect((err) => {
  if (err) {
    console.error("Erro conectando ao banco:", err);
    return;
  }
  console.log("Conectado ao MySQL");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  console.log("Query executada:", query);
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erro no banco de dados" });
    }

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: "Credenciais inválidas" });
    }
  });
});

app.get("/api/messages", (req, res) => {
  const search = req.query.search || "";

  let query = `SELECT m.message, u.username FROM messages m JOIN users u ON m.user_id = u.id`;

  if (search) {
    query += ` WHERE m.message LIKE '%${search}%'`;
  }

  query += ` ORDER BY m.created_at DESC LIMIT 50`;

  console.log("Query mensagens:", query);

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Erro no banco de dados" });
    }
    res.json(results);
  });
});

app.post("/api/getFlag", (req, res) => {
  const { secret } = req.body;

  if (secret === "admin123") {
    const query = `SELECT * FROM flags WHERE flag_name = 'main_flag'`;

    db.query(query, (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ error: "Erro ao buscar flag" });
      }
      res.json({ flag: results[0].flag_value });
    });
  } else {
    res.status(401).json({ error: "Acesso negado" });
  }
});

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("chat message", (data) => {
    const query = `INSERT INTO messages (user_id, message) VALUES (1, '${data.message}')`;

    db.query(query, (err) => {
      if (err) {
        console.error("Erro ao salvar mensagem:", err);
        return;
      }

      io.emit("chat message", {
        username: "Usuário",
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log("Acesse: http://localhost:3000");
  console.log("VULNERABILIDADES IMPLANTADAS:");
  console.log("- SQL Injection em /api/login");
  console.log("- SQL Injection em /api/messages");
  console.log("- XSS no chat via WebSocket");
  console.log("- Senha hardcoded para flag");
});
