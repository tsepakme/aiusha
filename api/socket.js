import { Server } from 'socket.io'

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Setting up socket.io')

    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('a user connected')

      socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
      })

      socket.on('disconnect', () => {
        console.log('user disconnected')
      })
    })
  }
  res.end()
}

export default ioHandler
