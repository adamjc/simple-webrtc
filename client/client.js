const socket = io()

let peerConnections = []

socket.on('disconnection', peerId => {
  console.log('%s disconnected', peerId)
  peerConnections = peerConnections.filter(pc => pc.peerId !== peerId)
})

socket.on('client-list', peerIds => {
  const pcs = peerIds.map(peerId => {
    const peer = new SimplePeer({ initiator: true, trickle: false })

    peer.on('signal', data => {
      socket.emit('signal', { peerId, data })
    })

    peer.on('connect', () => {
      const input = document.getElementById('input__text').removeAttribute('disabled')
      const button = document.getElementById('input__send').removeAttribute('disabled')
    })

    peer.on('data', addMessage)

    return { peerId, peer }
  })
  
  peerConnections = peerConnections.concat(pcs)
})

// A peer wants to give us its signalling data (description & ice candidatey stuff I guess)
socket.on('signal-receive', ({ peerId, data }) => {
  console.log('signal-receive', peerId, data)
  let pc = peerConnections.filter(pc => pc.peerId === peerId)[0]
  
  if (!pc) {
    const peer = new SimplePeer({ initiator: false, trickle: false })
    peer.signal(data)
    peer.on('signal', data => {
      socket.emit('signal', { peerId, data })
    })

    peer.on('connect', () => {
      document.getElementById('input__text').removeAttribute('disabled')
      document.getElementById('input__send').removeAttribute('disabled')
    })

    peer.on('data', addMessage)

    peerConnections.push({ peerId, peer })
  } else {
    console.log('peer connection found')
    pc.peer.signal(data)
  }
})

function addMessage (msg) {
  const messages = document.getElementById('messages')
  const message = document.createElement('div')
  message.innerHTML = msg
  messages.appendChild(message)
}

const button = document.getElementById('input__send')
button.addEventListener('click', e => {
  const message = document.getElementById('input__text').value
  peerConnections.forEach(({ peer }) => {
    peer.send(message)
  })
  addMessage(message)
})