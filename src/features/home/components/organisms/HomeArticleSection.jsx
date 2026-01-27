import { useState } from "react";
import HomeFeed from "../views/HomeFeed";
import useHomeFeed from "../../hooks/useHomeFeed";

const HomeArticleSection = ({ onOpenArticles, articles }) => {
  const [rating, setRating] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const { counts, metrics, thisWeekCount, carouselArticles, topRecommendations } = useHomeFeed({
    articles,
  });

  return (
    <HomeFeed
      onOpenArticles={onOpenArticles}
      rating={rating}
      onRate={setRating}
      selectedRecommendation={selectedRecommendation}
      onSelectRecommendation={setSelectedRecommendation}
      counts={counts}
      metrics={metrics}
      thisWeekCount={thisWeekCount}
      carouselArticles={carouselArticles}
      topRecommendations={topRecommendations}
      articles={articles}
    />
  );
};

export default HomeArticleSection;
