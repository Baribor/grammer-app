import { Configuration, OpenAIApi } from "openai";
import { useRef, useState } from "react";
import Chat from "./Chat";
import FeedBack from "./FeedBack";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const ChatContainer = () => {
  const textRef = useRef(null);
  const [chats, setChats] = useState([
    { isBot: true, text: "Hi, how are you doing?", isFeedBack: false },
  ]);
  const history = ["AI: Hi, how are you doing?"];
  
  

  const handleSend = async () => {
    let s = textRef.current.value;
    setChats((curr) => [
      ...curr,
      { isBot: false, text: textRef.current.value, isFeedBack: false },
    ]);

    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt:
        "Correct this to standard English:\n\n" +
        s +
        "\n\n| is_there_an_error | correct_sentence |",
      temperature: 0,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let t = response.data.choices[0].text;

    const [isError, correctStatement] = t
      .split("\n")
      .pop()
      .split("|")
      .filter((w) => w.trim() !== "")
      .map((w) => w.trim());

    if (isError === "Yes") {
      setChats((curr) => [
        ...curr,
        { isBot: true, isFeedBack: true, text: correctStatement },
      ]);
    }

    textRef.current.value = "";
    history.push("Human: " + correctStatement);

    const botResponse = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: history.join("\n"),
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });

    const botReply = botResponse.data.choices[0].text
      .split("\n")
      .pop()
      .slice(4);

    setChats((curr) => [
      ...curr,
      { isBot: true, text: botReply, isFeedBack: false },
    ]);
    history.push("AI: " + botReply);
  };

  return (
    <div className="container">
      <p>key is: {process.env.OPENAI_API_KEY}</p>
      <div className="chat">
        {chats.map((chat, i) =>
          chat.isFeedBack ? (
            <FeedBack text={chat.text} />
          ) : (
            <Chat key={i} isBot={chat.isBot} text={chat.text} />
          )
        )}
      </div>

      <div className="textbox">
        <textarea
          name="speech"
          id="speech"
          rows="8"
          cols="40"
          ref={textRef}
        ></textarea>
        <div id="sendBtn" onClick={handleSend}>
          Send
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
