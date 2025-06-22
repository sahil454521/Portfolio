import { motion } from "framer-motion";

const BentoCard = () => {
  return (
    <motion.div
      className="bento-card p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      whileHover={{ scale: 1.05 }}
    >
      <h2 className="text-xl font-semibold mb-2">Bento Card Title</h2>
      <p className="text-gray-600 mb-4">Description of the bento card content goes here.</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
        Action Button
      </button>
    </motion.div>
  );
};

export default BentoCard;