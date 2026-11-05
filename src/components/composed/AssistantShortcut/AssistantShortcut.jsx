import { Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import styles from "./AssistantShortcut.module.css";

function AssistantShortcut() {
  const { pathname } = useLocation();

  if (pathname === "/chatbot") {
    return null;
  }

  return (
    <Link
      className={styles.shortcut}
      to="/chatbot"
      aria-label="Ask Assistant"
    >
      <span className={styles.icon} aria-hidden="true">
        <Bot size={22} strokeWidth={2} />
      </span>
      <span>Ask Assistant</span>
    </Link>
  );
}

export default AssistantShortcut;
