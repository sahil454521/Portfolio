import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BlogPost = ({ post, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="bg-[#1a1a1a] rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{post.date}</p>
      <p className="text-gray-300 mb-4">{!isExpanded ? post.excerpt : post.content}</p>
      
      <motion.div
        className="text-blue-400 font-medium"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
      >
        {isExpanded ? "Read less" : "Read more"}
      </motion.div>
    </motion.div>
  );
};

export default BlogPost;