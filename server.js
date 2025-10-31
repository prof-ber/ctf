const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const secret =
  'o43flwbgol4ehpvn3uisenb4hqgboionbkuw45o43flbquigbqol3i4fbvgqu3ybvqluwv';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'chat_app',
});

db.connect((err) => {
  if (err) {
    console.error('Erro conectando ao banco:', err);
    return;
  }
  console.log('Conectado ao MySQL');
});

app.use((req, res, next) => {
  if (req.cookies && req.cookies.userData) {
    try {
      const userData = JSON.parse(req.cookies.userData);
      if (userData.userId) {
        const query = `SELECT * FROM users WHERE id = ?`;
        console.log('Cookie SQLi Query:', query);

        db.query(query, [userData], (err, results) => {
          if (!err && results.length > 0) {
            req.user = results[0];
          }
          next();
        });
        return;
      }
    } catch (e) {
      // Ignora erros
    }
  }
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota VULNERÁVEL - SQL Injection via Cookie
app.get('/api/profile', (req, res) => {
  if (req.cookies && req.cookies.userProfile) {
    try {
      const profileData = JSON.parse(req.cookies.userProfile);
      const query = `SELECT * FROM users WHERE username = ?`;
      console.log('Profile SQLi Query:', query);

      db.query(query, [profileData.username], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Erro no banco de dados' });
        }
        res.json({ profile: results[0] || {} });
      });
    } catch (e) {
      res.status(400).json({ error: 'Cookie inválido' });
    }
  } else {
    res.status(401).json({ error: 'Cookie não encontrado' });
  }
});

app.post('/api/login-jwt', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  console.log('Query JWT executada:', query);
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }

    if (results.length > 0) {
      const user = results[0];

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          admin: user.username === 'admin',
        },
        secret,
        { algorithm: 'HS256' }
      );

      res.json({
        success: true,
        user: user,
        token: token,
      });
    } else {
      res.json({ success: false, message: 'Credenciais inválidas' });
    }
  });
});

app.get('/api/admin-data', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    if (decoded.admin) {
      const query = `SELECT * FROM flags`;
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Erro no banco de dados' });
        }
        res.json({ flags: results, user: decoded });
      });
    } else {
      res.status(403).json({ error: 'Acesso negado - não é admin' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  console.log('Query executada:', query);
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: 'Credenciais inválidas' });
    }
  });
});

app.get('/api/messages', (req, res) => {
  const search = req.query.search || '';

  let query = `SELECT m.message, u.username FROM messages m JOIN users u ON m.user_id = u.id`;

  if (search) {
    query += ` WHERE m.message LIKE ?`;
  }

  query += ` ORDER BY m.created_at DESC LIMIT 50`;

  console.log('Query mensagens:', query);

  db.query(query, [search], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }
    res.json(results);
  });
});

app.post('/api/getFlag', (req, res) => {
  const { secret } = req.body;

  if (secret === 'admin123') {
    const query = `SELECT * FROM flags WHERE flag_name = 'main_flag'`;

    db.query(query, (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ error: 'Erro ao buscar flag' });
      }
      res.json({ flag: results[0].flag_value });
    });
  } else {
    res.status(401).json({ error: 'Acesso negado' });
  }
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('chat message', (data) => {
    const query = `INSERT INTO messages (user_id, message) VALUES (1, '${data.message}')`;

    db.query(query, (err) => {
      if (err) {
        console.error('Erro ao salvar mensagem:', err);
        return;
      }

      io.emit('chat message', {
        username: 'Usuário',
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Acesse: http://localhost:3000');
  console.log('VULNERABILIDADES IMPLANTADAS:');
  console.log('- SQL Injection em /api/login');
  console.log('- SQL Injection em /api/messages');
  console.log('- XSS no chat via WebSocket');
  console.log('- Senha hardcoded para flag');
});
