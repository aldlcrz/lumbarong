import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-[1rem] shadow-sm border border-gray-100 overflow-hidden card-hover">
            <div className="h-48 bg-gray-50 relative group">
                <img
                    src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/300x400?text=Barong'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors"></div>
                <Link href={`/products/${product.id}`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer">
                        <Eye size={20} />
                    </div>
                </Link>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[13px] font-bold text-gray-900 truncate flex-1 uppercase tracking-tight">{product.name}</h3>
                    <span className="bg-red-50 text-red-600 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ml-2 shrink-0 border border-red-100">
                        {(product.category?.name || (typeof product.category === 'string' ? product.category : 'Barong')).split(' ')[0]}
                    </span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium line-clamp-1 mb-2">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-[7px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Artisan Price</p>
                        <p className="text-base font-black text-red-600 leading-none">₱{product.price.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => addToCart(product)}
                        className="bg-gray-900 text-white p-2.5 rounded-lg hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                        title="Add to Cart"
                    >
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
