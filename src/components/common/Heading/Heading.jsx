import { createElement } from "react";
import styles from "./Heading.module.css";

function Heading({
  eyebrow,
  title,
  description,
  align = "left",
  size = "large",
  as: component = "h2",
  className = "",
}) {
  const headingClasses = [
    styles.heading,
    styles[align],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={headingClasses}>
      {eyebrow && (
        <span className={styles.eyebrow}>
          {eyebrow}
        </span>
      )}

      {title && (
        createElement(component, { className: styles.title }, title)
      )}

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}
    </div>
  );
}

export default Heading;