import React from 'react';

const PRODUCTS = [
  { id: 'ASSET-01', name: 'Liquidity Pair A', price: 5000, skew: 'B2B-FIXED' },
  { id: 'ASSET-02', name: 'Treasury Bond X', price: 12500, skew: 'B2B-MARKET' },
];

const ProductList = ({ onSelect, disabled }) => {
  return (
    <div className="grid gap-4 mt-6">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select Asset for Ingestion</h3>
      {PRODUCTS.map((product) => (
        <div 
          key={product.id}
          className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex justify-between items-center hover:border-emerald-500/50 transition-colors"
        >
          <div>
            <div className="font-bold text-slate-100">{product.name}</div>
            <div className="text-xs text-slate-500">{product.id} | {product.skew}</div>
          </div>
          <button
            onClick={() => onSelect({ total: product.price, asset_id: product.id })}
            disabled={disabled}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm disabled:opacity-50"
          >
            BUY ${product.price.toLocaleString()}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductList;