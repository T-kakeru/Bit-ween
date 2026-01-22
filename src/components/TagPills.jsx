const TagPills = ({ tags, articleId }) => (
  <div className="card-tags">
    {tags.map((tag) => (
      <span key={`${articleId}-${tag}`} className="tag-pill">
        {tag}
      </span>
    ))}
  </div>
);

export default TagPills;
