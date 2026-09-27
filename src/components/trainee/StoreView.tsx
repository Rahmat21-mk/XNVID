import React, { useState } from 'react';
import {
  Plus,
  Check,
  Tag,
  Info
} from 'lucide-react';
import { ProductItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/format';

interface StoreViewProps {
  searchQuery: string;
  openCheckout: () => void;
}

export const StoreView: React.FC<StoreViewProps> = ({ searchQuery, openCheckout }) => {
  const { products, addToCart, cart } = useApp();

  const [selectedProductModal, setSelectedProductModal] = useState<ProductItem | null>(null);
  const [addedPopupId, setAddedPopupId] = useState<string | null>(null);

  // Filter pencarian berdasarkan nama dan deskripsi produk (tanpa kategori)
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  const handleAddToCart = (product: ProductItem) => {
    addToCart(product, 1);
    setAddedPopupId(product.id);
    setTimeout(() => {
      setAddedPopupId(null);
    }, 1200);
  };

  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Ringkas Toko */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block mb-1">
            Pengadaan Alat Resmi
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Toko Bahan & Alat Praktik Bersertifikat
          </h2>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Dapatkan peralatan uji kelistrikan, modul trainer PLC, dan APD standar industri dengan harga subsidi khusus peserta (Rupiah).
          </p>
        </div>

        {totalCartItems > 0 && (
          <div className="bg-white/10 border border-white/20 p-3.5 rounded-xl text-center shrink-0">
            <p className="text-xs text-slate-200">Isi Keranjang</p>
            <p className="text-xl font-extrabold text-white my-0.5">{totalCartItems} Barang</p>
            <button
              onClick={openCheckout}
              className="mt-1 px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-lg transition"
            >
              Lihat Keranjang →
            </button>
          </div>
        )}
      </div>

      {/* Grid Produk (Kategori dihapus, Harga Rupiah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const inCartItem = cart.find(i => i.product.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Foto Produk */}
                <div
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProductModal(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {product.discountPercentage > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center">
                      <Tag className="w-3 h-3 mr-0.5" />
                      Hemat {product.discountPercentage}%
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    Stok: {product.quantity}
                  </div>
                </div>

                {/* Rincian Produk */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedProductModal(product)}
                      className="font-bold text-xs text-slate-900 mt-1 line-clamp-2 hover:text-blue-600 cursor-pointer transition leading-snug"
                    >
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {formatRupiah(product.finalPrice)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-[11px] text-slate-400 line-through font-mono">
                          {formatRupiah(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity <= 0}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          product.quantity <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : addedPopupId === product.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                        }`}
                      >
                        {addedPopupId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ditambahkan!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Keranjang {inCartItem ? `(${inCartItem.quantity})` : ''}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedProductModal(product)}
                        className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition"
                        title="Lihat Rincian"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Produk */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                <img
                  src={selectedProductModal.image}
                  alt={selectedProductModal.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedProductModal.name}
                  </h3>
                  <p className="text-slate-400 font-mono mt-1 text-[11px]">
                    SKU: {selectedProductModal.sku} • Bobot: {selectedProductModal.weightKg} kg
                  </p>

                  <div className="mt-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Harga Normal:</span>
                      <span className="line-through font-mono">
                        {formatRupiah(selectedProductModal.originalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-emerald-700">
                      <span>Subsidi Pelatihan:</span>
                      <span>Diskon {selectedProductModal.discountPercentage}%</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                      <span>Harga Akhir:</span>
                      <span className="font-mono text-blue-700 font-extrabold">
                        {formatRupiah(selectedProductModal.finalPrice)}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 mt-3.5 leading-relaxed text-[11px]">
                    {selectedProductModal.description}
                  </p>
                </div>

                <div className="mt-4 flex space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProductModal);
                      setSelectedProductModal(null);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={() => setSelectedProductModal(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
