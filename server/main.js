const path = require('path')
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

let connections = []

io.on('connection', client => {
  console.log(`${client.conn.id} connected`)

  connections.forEach(connection => {
    connection.emit('connection', client.conn.id)
  })

  connections.push(client)

  client.on('disconnect', e => {
    console.log(`${client.conn.id} disconnected`)
    connections = connections.filter(c => c.conn.id !== client.conn.id)
  })

  client.on('candidate', candidate => {
    // client has sent us its candidate
    connections.forEach(connection => {
      connection.emit('candidate', candidate)
    })
  })

  client.on('description', ({ description, peer }) => {
    // client has sent us a description and peer it wants to connect to
  })
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
});

server.listen(1337, () => {
  console.log('server listening...')
})