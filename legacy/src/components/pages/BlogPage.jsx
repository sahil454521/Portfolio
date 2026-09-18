import React from 'react';
import Blog from '../components/Blog';
import BlogLayout from '../components/BlogLayout';

const BlogPage = () => {
  return (
    <BlogLayout>
      <Blog />
    </BlogLayout>
  );
};

export default BlogPage;