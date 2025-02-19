import { createServer } from "http";
import { Server } from "socket.io";
import { redisManager } from "./redisManager";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  }
});


io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    socket.join(documentId);
    const events = await redisManager.getQueue('123');
    if (events && events.length > 0) {
      socket.emit("load-events", events);
    }

    socket.on("send-changes", async delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
      await redisManager.pushToQueue('123', delta)
    })
    

    socket.on("delete-queue", async (data) => {
      console.log('delete-queue', data);
      if(data === 0) return;
      await redisManager.removeFromQueue('123', data);
    })
  })
})


httpServer.listen(3001);


