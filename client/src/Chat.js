import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

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
  const [message, setMessage] = useState();

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: formatAMPM(new Date()),
        id: new Date(),
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

  const updateMessage = (message) => {
    const newMessageAfterUpdate = messageList.map(
      (msg) => message.id !== msg.id
    );
    socket.emit("update_message", { data: newMessageAfterUpdate, room });
    setMessageList(newMessageAfterUpdate);
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
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
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
                <button onClick={() => removeMessage(messageContent)}>
                  &#x2425;{" "}
                </button>
                <button onClick={() => updateMessage(messageContent)}>
                  &#xf304;{" "}
                </button>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />

        {/*<button onClick={updateMessage}> &#xf304; </button> */}
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
