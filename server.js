const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const serial = new SerialPort({
  path: 'COM5', // ⚠ Update if different
  baudRate: 9600,
  autoOpen: false
});

// Serve static files from "public"
app.use(express.static('public'));

// Serial Connection
serial.open((err) => {
  if (err) {
    console.error('Failed to open serial port:', err.message);
  } else {
    console.log('Serial port opened.');
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('connect-robot', () => {
    console.log('Robot connection requested');
    if (serial.isOpen) serial.write('C');
  });

  socket.on('control', (command) => {
    if (serial.isOpen) {
      serial.write(command);
      console.log('Command sent:', command);
    }
  });

  serial.on('data', (data) => {
    console.log('Received from Arduino:', data.toString());
    socket.emit('robot-data', data.toString());
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});