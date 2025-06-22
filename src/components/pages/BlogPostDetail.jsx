import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import blogPosts from '../data/blog-posts';

const BlogPostDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find(post => post.id === parseInt(id));

  if (!post) {
    return <div className="text-white text-center">Post not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.h2 
        className="text-3xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {post.title}
      </motion.h2>
      <p className="text-gray-400 text-sm mb-4">{post.date}</p>
      <motion.div 
        className="bg-[#1a1a1a] rounded-lg p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-300">{post.content}</p>
      </motion.div>
    </div>
  );
};

export default BlogPostDetail;