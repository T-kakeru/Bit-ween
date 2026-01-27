import { useMemo, useState } from "react";
import HomeFeed from "@/features/home/components/views/HomeFeed";
import useHomeFeed from "@/features/home/hooks/useHomeFeed";
import mockArticles from "@/shared/data/mock/articles.json";

// pages: 画面全体の状態を統合する（選択/アンケートなど）
const HomePage = ({ onOpenArticles, savedArticles }) => {
  const [rating, setRating] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const { applySavedState } = savedArticles;

  const articles = useMemo(() => applySavedState(mockArticles), [applySavedState]);

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

export default HomePage;
