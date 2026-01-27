const Button = ({ type = "button", className = "", ...props }) => (
  <button type={type} className={className} {...props} />// プロップス
);

export default Button;
