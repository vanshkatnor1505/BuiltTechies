import { createElement } from "react";
import styles from "./Card.module.css";

function Card({
  children,
  variant = "default",
  size = "medium",
  hoverable = false,
  padding = "medium",
  as: component = "div",
  className = "",
  ...props
}) {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[size],
    styles[`padding-${padding}`],
    hoverable ? styles.hoverable : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    createElement(
      component,
      {
        className: cardClasses,
        ...props,
      },
      children
    )
  );
}

export default Card;