import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  }
});


io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    socket.join(documentId)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    // socket.on("save-document", async data => {
    // })
  })
})


httpServer.listen(3001);


