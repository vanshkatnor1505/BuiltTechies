import { createElement } from "react";
import styles from "./Section.module.css";

function Section({
  children,
  className = "",
  id,
  as: component = "section",
  spacing = "default",
}) {
  return (
    createElement(
      component,
      {
        id,
        className: `${styles.section} ${styles[spacing]} ${className}`,
      },
      children
    )
  );
}

export default Section;