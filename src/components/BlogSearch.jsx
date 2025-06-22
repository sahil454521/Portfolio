import React, { useState } from 'react';

const BlogSearch = ({ posts, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Search blog posts..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default BlogSearch;