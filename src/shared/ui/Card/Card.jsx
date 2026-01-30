import styles from "./Card.module.css";

const Card = ({ as: Component = "div", className = "", children, ...props }) => (
  <Component className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
    {children}
  </Component>
);

export default Card;
