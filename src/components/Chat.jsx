import classnames from "classnames";

const Chat = ({ isBot, text }) => {
  return (
    <div className={classnames("msg", { bot: isBot, user: !isBot })}>
      <p>{text}</p>
    </div>
  );
};

export default Chat;
