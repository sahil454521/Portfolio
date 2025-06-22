import { motion } from "framer-motion";

interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ image, title, price, onAddToCart }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-lg text-gray-700">${price.toFixed(2)}</p>
        <button
          onClick={onAddToCart}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;