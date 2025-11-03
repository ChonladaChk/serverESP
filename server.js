const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // 👈 สร้าง server หลักด้วย http
const io = new Server(server); // 👈 ผูก socket.io กับ server นี้

app.use(express.json());

// --- 1. ตัวแปรเก็บสถานะไฟ (ใช้ร่วมกัน) ---
let lightState = 'off'; 

// --- 2. Endpoint สำหรับรับค่า Sensor จาก ESP32 ---
app.post("/data", (req, res) => {
  console.log("📥 Sensor From ESP32:", req.body);
  io.emit("newData", req.body); // 👈 ส่งข้อมูลไปหน้าเว็บทันที
  res.json({ status: "ok", received: req.body });
});
// (ลบ app.post('/data') ที่ซ้ำซ้อนออกไป)

// --- 3. Endpoint ให้หน้าเว็บส่งคำสั่งมา ---
app.post('/control', (req, res) => {
  lightState = req.body.state; // รับค่า 'on' หรือ 'off'
  console.log('💡 Command received:', lightState);
  res.send({ status: 'ok', newState: lightState });
});

// --- 4. Endpoint ให้ ESP32 มาดึงสถานะ ---
app.get('/status', (req, res) => {
  console.log("ESP32 is asking for status... sending:", lightState);
  res.json({ light: lightState });
});

// --- 5. Endpoint สำหรับเปิดหน้าเว็บ ---
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// --- 6. จัดการการเชื่อมต่อ Socket.io ---
io.on("connection", (socket) => {
  console.log("🟢 Web client connected via Socket.io");
});

// --- 7. สตาร์ทเซิร์ฟเวอร์ (สำคัญมาก) ---
// ❗️ ต้องใช้ server.listen ไม่ใช่ app.listen
server.listen(3000, () => { // 👈 แก้ไขตรงนี้
  console.log('Server is running on port 3000 (with Socket.io enabled)');
});