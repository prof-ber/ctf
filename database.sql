-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

-- Tabela de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensagens
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela com a flag
CREATE TABLE flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flag_name VARCHAR(50),
    flag_value VARCHAR(255)
);

-- Inserir dados iniciais
INSERT INTO users (username, password) VALUES 
('usuario1', 'senha123'),
('admin', 'password')
('teste', 'teste123');

INSERT INTO messages (user_id, message) VALUES 
(1, 'Bem-vindo ao chat!'),
(2, 'Olá pessoal!'),
(3, 'Como vocês estão?');

-- NÃO MODIFICAR :)
INSERT INTO flags (flag_name, flag_value) VALUES 
('main_flag', 'Um gato chamado Flauros'),
('backup_flag', 'Uma coruja chamada Stolas'),
('secret_flag', 'Uma calopsita chamada Andras'),
('hidden_flag', 'Um papagaio chamado Phenex'),
('extra_flag', 'Um gato chamado Buer');