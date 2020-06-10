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
      console.log('signalling as offerer...')
      console.log(`data: ${JSON.stringify(data, null, 2)}`)
      console.log(`peerId: ${JSON.stringify(peerId, null, 2)}`)
      socket.emit('signal', { peerId, data })
    })

    peer.on('connect', () => {
      console.log('connected')
      peer.send('What uuup, initiating true')
    })

    peer.on('data', data => console.log(data.toString()))

    return { peerId, peer }
  })
  
  peerConnections = peerConnections.concat(pcs)
})

// A peer wants to give us its signalling data (description & ice candidatey stuff I guess)
socket.on('signal-receive', ({ peerId, data }) => {
  console.log('signal-receive')
  console.log(`peerId: ${JSON.stringify(peerId, null, 2)}`)
  console.log(`data: ${JSON.stringify(data, null, 2)}`)
  let pc = peerConnections.filter(pc => pc.peerId === peerId)[0]
  
  if (!pc) {
    console.log('peer connection not found')
    const peer = new SimplePeer({ initiator: false, trickle: false })
    peer.signal(data)
    peer.on('signal', data => {
      console.log('signalling as answerer...')
      socket.emit('signal', { peerId, data })
    })

    peer.on('connect', () => {
      console.log('connected')
      peer.send('What uuup, initiating false')
    })

    peer.on('data', data => console.log(data.toString()))

    peerConnections.push({ peerId, peer })
  } else {
    console.log('peer connection found')
    pc.peer.signal(data)
  }
})