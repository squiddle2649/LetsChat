import React, { useState, useEffect } from 'react';

export const TestUI = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = 3000; // time in ms to consider user has stopped typing

  let typingTimer;

  const handleChange = (event) => {
    setMessage(event.target.value);
    setIsTyping(true);

    // Clear the previous timer
    clearTimeout(typingTimer);

    // Set a new timer to reset typing status
    typingTimer = setTimeout(() => {
      setIsTyping(false);
      notifyTyping(false); // Notify that the user has stopped typing
    }, typingTimeout);

    notifyTyping(true); // Notify that the user is typing
  };

  const notifyTyping = (typingStatus) => {
    // Here you would send the typing status to the server or other users
    console.log(`User is typing: ${typingStatus}`);
    // e.g., socket.emit('typing', { isTyping: typingStatus });
  };

  useEffect(() => {
    // Cleanup the timer when component unmounts
    return () => clearTimeout(typingTimer);
  }, []);

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={handleChange}
        placeholder="Type your message..."
      />
      {isTyping && <p>User is typing...</p>}
    </div>
  );
};


