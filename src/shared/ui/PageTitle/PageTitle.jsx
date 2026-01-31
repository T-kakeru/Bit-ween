import Heading from "@/shared/ui/Heading";
import styles from "./PageTitle.module.css";

const PageTitle = ({ title }) => {
  if (!title) return null;
  return (
    <div className={styles.root}>
      <Heading level={1} className={styles.title}>
        {title}
      </Heading>
    </div>
  );
};

export default PageTitle;
