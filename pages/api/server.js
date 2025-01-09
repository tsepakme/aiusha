import { Server } from 'socket.io'

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Setting up socket.io')

    const io = new Server(res.socket.server)
    res.socket.server.io = io

    let players = []
    let board = Array(9).fill(null)
    let isXNext = true

    io.on('connection', (socket) => {
      if (players.length < 2) {
        const player = players.length === 0 ? 'X' : 'O'
        players.push(player)
        socket.emit('player', player)
      }

      socket.on('move', (data) => {
        board = data.board
        isXNext = data.isXNext
        io.emit('move', { board, isXNext })
      })

      socket.on('disconnect', () => {
        players = players.filter((player) => player !== socket.player)
        if (players.length === 0) {
          board = Array(9).fill(null)
          isXNext = true
        }
      })
    })
  }
  res.end()
}

export default ioHandler
