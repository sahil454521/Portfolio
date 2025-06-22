import { motion } from "framer-motion";

const FeatureHighlight = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Key Features</h2>
      <ul className="list-disc list-inside">
        <li className="mb-2">Intelligent Pricing</li>
        <li className="mb-2">Smart Bartering</li>
        <li className="mb-2">Personalized Recommendations</li>
        <li className="mb-2">Seamless Checkout Experience</li>
      </ul>
    </motion.div>
  );
};

export default FeatureHighlight;