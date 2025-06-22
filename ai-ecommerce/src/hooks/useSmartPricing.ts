import { useEffect, useState } from "react";

const useSmartPricing = (basePrice, demandFactor, competitorPrice) => {
  const [finalPrice, setFinalPrice] = useState(basePrice);

  useEffect(() => {
    const calculatePrice = () => {
      let price = basePrice;

      // Adjust price based on demand factor
      if (demandFactor > 1) {
        price *= demandFactor; // Increase price if demand is high
      } else if (demandFactor < 1) {
        price *= demandFactor; // Decrease price if demand is low
      }

      // Compare with competitor price and adjust accordingly
      if (competitorPrice && price > competitorPrice) {
        price = competitorPrice; // Match competitor price if it's lower
      }

      setFinalPrice(price);
    };

    calculatePrice();
  }, [basePrice, demandFactor, competitorPrice]);

  return finalPrice;
};

export default useSmartPricing;