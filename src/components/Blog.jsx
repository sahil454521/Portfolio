import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BlogPost from './BlogPost';
import blogPosts from './data/blog-posts';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Simulate loading posts
    setTimeout(() => {
      setPosts(blogPosts);
    }, 500);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.h2 
        className="text-3xl font-bold text-white mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        My Blog
      </motion.h2>
      
      <div className="space-y-8">
        {posts.length === 0 ? (
          <div className="flex justify-center">
            <div className="loader w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          posts.map((post, index) => (
            <BlogPost key={post.id} post={post} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;