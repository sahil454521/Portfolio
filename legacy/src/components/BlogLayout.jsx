import React from 'react';

const BlogLayout = ({ children }) => {
  return (
    <div className="bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
};

export default BlogLayout;