const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const SocketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 初始化Socket处理器
new SocketHandler(io);

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 