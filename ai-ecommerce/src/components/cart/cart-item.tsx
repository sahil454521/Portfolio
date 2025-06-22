import React from 'react';

interface CartItemProps {
  id: string;
  title: string;
  price: number;
  quantity: number;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ id, title, price, quantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-600">Price: ${price.toFixed(2)}</p>
        <p className="text-gray-600">Quantity: {quantity}</p>
      </div>
      <button 
        onClick={() => onRemove(id)} 
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;