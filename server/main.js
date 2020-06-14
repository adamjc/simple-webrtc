const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

// connections is an array of Socket defined by Socket.IO
let connections = []

io.on('connection', client => {
  console.log(`${client.conn.id} connected`)
  client.emit('client-list', connections.map(c => c.conn.id))
  connections.push(client)
  connections.forEach(connection => {
    connection.emit('')
  })

  client.on('disconnect', e => {
    console.log(`${client.conn.id} disconnected`)
    connections = connections.filter(c => c.conn.id !== client.conn.id)
    connections.forEach(connection => {
      connection.emit('disconnection', client.conn.id)
    })
  })

  client.on('signal', ({ peerId, data }) => {
    console.log('signal received from client...')
    const peer = connections.filter(c => c.conn.id == peerId)[0]
    if (peer) {
      console.log(`peer.conn.id: ${JSON.stringify(peer.conn.id, null, 2)}`)
      console.log(`client.conn.id: ${JSON.stringify(client.conn.id, null, 2)}`)
      peer.emit('signal-receive', { peerId: client.conn.id, data })
    } else {
      console.log('peer %s does not exist', peer)
    }
  })
});

app.use(express.static('client'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
});

server.listen(1337, () => {
  console.log('server listening...')
})