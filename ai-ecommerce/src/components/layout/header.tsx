import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          AI-Powered E-Commerce
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-blue-400">Home</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-blue-400">Products</Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-blue-400">Cart</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-400">About</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;