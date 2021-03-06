import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
// import attachment from "../assets/paper-clip.png";

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  // const [message, setMessage] = useState();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: formatAMPM(new Date()),
        id: new Date(),
        socketId: socket.id,
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  const removeMessage = (message) => {
    const newMessageAfterDelete = messageList.filter(
      (msg) => message.id !== msg.id
    );
    socket.emit("delete_message", { data: newMessageAfterDelete, room });
    setMessageList(newMessageAfterDelete);
  };

  const EditMessage = (message) => {
    const newEditMessage = messageList.map((msg) => {
      if (message.id === msg.id) {
        const data = prompt();
        msg.message = data;
      }
      return msg;
    });
    socket.emit("edit_message", { data: newEditMessage, room });
    setMessageList(newEditMessage);
  };
  // const updateMessage = (message) => {
  //   socket.emit("update_message", { data: newMessageAfterUpdate, room });
  //   updateMessage(newMessageAfterUpdate);
  // };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    socket.on("delete_message-server", (data) => {
      console.log(data);
      setMessageList(data);
    });

    socket.on("edit_message-server", (data) => {
      setMessageList(data);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Apna Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
                <div className="my_button">
                  <button onClick={() => removeMessage(messageContent)}>
                    Del{" "}
                  </button>
                </div>
                <div className="our_button">
                  <button onClick={() => EditMessage(messageContent)}>
                    Edit{" "}
                  </button>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hello..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />

        {/*       
        <label htmlFor="hidden-file">
          <img width="20" src={attachment} alt={""} />
        </label> */}
        {/* <button>
          <img width="20" src={attachment} alt={""} />
        </button> */}

        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
