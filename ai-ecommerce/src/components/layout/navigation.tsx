import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">AI E-Commerce</Link>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/products" className="text-gray-300 hover:text-white">Products</Link>
          </li>
          <li>
            <Link href="/cart" className="text-gray-300 hover:text-white">Cart</Link>
          </li>
          <li>
            <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
          </li>
          <li>
            <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;