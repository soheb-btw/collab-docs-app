import { useCallback, useEffect, useState, useRef} from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams } from "react-router-dom"
import axios from "axios"

const SAVE_INTERVAL_MS = 10000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

export default function TextEditor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState();
  const eventsLength = useRef(0);

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(async() => {
      // socket.emit("save-document", quill.getContents())
      const document = quill.getText();
      await axios.put(`http://localhost:3000/sheet/123`, {content: document});
      socket.emit('delete-queue', eventsLength.current);
      eventsLength.current = 0;
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill]);

  useEffect(() => {

    async function getSheets() {
      if (socket == null || quill == null) return;

      const response = await axios.get(`http://localhost:3000/sheet`);
      console.log(response.data[0].content);
      quill.setText(response.data[0].content);
      quill.enable();

      socket.emit("get-document", documentId)
    }

    getSheets();
  }, [quill, socket]);
  

  useEffect(() => {
    if (socket == null || quill == null) return

    const receiveChangesHandler = delta => {
      quill.updateContents(delta)
    }

    const loadEventsHandler = events => {
      events.forEach(event => {   
        console.log(event);     
        quill.updateContents(event);
      });
    }
    
    socket.on("receive-changes", receiveChangesHandler)

    socket.on("load-events", loadEventsHandler);

    return () => {
      socket.off("receive-changes", receiveChangesHandler);
      socket.off("load-events", loadEventsHandler);
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      eventsLength.current = eventsLength.current + 1;

      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])

  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    // q.disable()
    // q.setText("Loading...")
    setQuill(q)
  }, [])
  return <div className="container" ref={wrapperRef}></div>
}