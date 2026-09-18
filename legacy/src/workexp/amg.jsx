import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AMGExperience = () => {
  return (
    <div className="bg-[#111111] min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto text-white"> 
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-10"
        >
          AMG Projects Experience
        </motion.h1>
        
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Work in Progress</h2>
          <p className="text-gray-300">
            This page is currently being developed to showcase my experience at AMG Projects. 
            Check back soon for a detailed breakdown of the projects I worked on.
          </p>
          
          <div className="mt-6 flex justify-center">
            <Link to="/" className="border border-white text-white py-2 px-4 rounded hover:bg-white hover:text-black transition-all">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMGExperience;