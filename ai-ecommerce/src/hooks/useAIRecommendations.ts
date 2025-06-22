import { useEffect, useState } from 'react';
import { fetchAIRecommendations } from '@/services/ai-service';

export const useAIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRecommendations = async () => {
      try {
        const data = await fetchAIRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, []);

  return { recommendations, loading, error };
};