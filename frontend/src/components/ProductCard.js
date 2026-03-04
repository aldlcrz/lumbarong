import Link from 'next/link';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useRouter } from 'next/router';

export default function ProductCard({ product }) {
    const router = useRouter();

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

                <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center text-amber-500">
                        <Star size={10} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-black text-gray-900">{Number(product.averageRating || 0).toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400 font-medium border-l border-gray-100 pl-1.5 ml-0.5">({product.totalRatings || 0})</span>
                </div>

                <div className="flex items-center justify-between mt-auto gap-2">
                    <div className="flex-1">
                        <p className="text-[7px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Artisan Price</p>
                        <p className="text-sm font-black text-red-600 leading-none">₱{product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1.5">
                        {/* Add to Cart → goes to product page to select options, then add to cart */}
                        <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-all active:scale-95 border border-red-100"
                            title="Select Options & Add to Cart"
                        >
                            <ShoppingCart size={14} />
                        </button>
                        {/* Buy Now → goes to product page to select options, then buy now */}
                        <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-black transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
