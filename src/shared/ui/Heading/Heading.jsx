import styles from "./Heading.module.css";

const clampLevel = (level) => {
	const num = Number(level);
	if (!Number.isFinite(num)) return 2;
	if (num < 1) return 1;
	if (num > 6) return 6;
	return num;
};

const Heading = ({ level = 2, as = undefined, className = "", ...props }) => {
	const safeLevel = clampLevel(level);
	const Component = as || `h${safeLevel}`;

	return <Component className={[styles.root, className].filter(Boolean).join(" ")} {...props} />;
};

export default Heading;

