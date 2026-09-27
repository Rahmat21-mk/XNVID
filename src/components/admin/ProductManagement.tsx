import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ProductItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/format';

export const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form Fields: nama produk, harga asli (Rupiah), persentase diskon, kuantitas (stok), bobot, dan deskripsi
  const [name, setName] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(750000);
  const [discountPercentage, setDiscountPercentage] = useState<number>(15);
  const [quantity, setQuantity] = useState<number>(25);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter produk berdasarkan nama atau SKU (tanpa kategori)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setName('');
    setOriginalPrice(500000);
    setDiscountPercentage(10);
    setQuantity(30);
    setDescription('');
    setImage('https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80');
    setWeightKg(1.5);
    setEditingProduct(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setName(p.name);
    setOriginalPrice(p.originalPrice);
    setDiscountPercentage(p.discountPercentage);
    setQuantity(p.quantity);
    setDescription(p.description);
    setImage(p.image);
    setWeightKg(p.weightKg);
    setEditingProduct(p);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Handler unggah gambar dari galeri perangkat
  const handleImageUploadFromGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Ukuran gambar maksimal adalah 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setFormError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }

    if (originalPrice <= 0) {
      setFormError('Harga asli dalam Rupiah harus lebih dari 0.');
      return;
    }

    const payload = {
      name: name.trim(),
      originalPrice: Number(originalPrice),
      discountPercentage: Number(discountPercentage),
      quantity: Number(quantity),
      description: description.trim() || 'Peralatan praktikum resmi standar industri.',
      image: image.trim() || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      weightKg: Number(weightKg) || 1
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsAddModalOpen(false);
  };

  const calculatedFinalPrice = Math.max(0, originalPrice - originalPrice * (discountPercentage / 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Katalog Produk & Peralatan Praktik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data produk dengan penetapan harga dalam Rupiah (Rp) dan pengambilan foto langsung dari galeri.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center transition shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Kolom Pencarian */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama produk, SKU, atau spesifikasi alat..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Tabel Produk (Kategori dihapus, Harga Rupiah) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">Nama Produk & SKU</th>
                <th className="px-4 py-3">Harga Asli</th>
                <th className="px-4 py-3">Diskon</th>
                <th className="px-4 py-3">Harga Akhir</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, idx) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block max-w-sm truncate text-xs">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {prod.sku} • Bobot: {prod.weightKg} kg
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 font-mono font-bold text-slate-700">
                      {formatRupiah(prod.originalPrice)}
                    </td>

                    <td className="px-4 py-2.5">
                      {prod.discountPercentage > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 font-mono">
                          -{prod.discountPercentage}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 font-mono font-bold text-blue-700 text-xs">
                      {formatRupiah(prod.finalPrice)}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => updateProduct(prod.id, { quantity: Math.max(0, prod.quantity - 1) })}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition"
                          title="Kurangi stok"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-7 text-center text-xs text-slate-900">
                          {prod.quantity}
                        </span>
                        <button
                          onClick={() => updateProduct(prod.id, { quantity: prod.quantity + 1 })}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition"
                          title="Tambah stok"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${prod.name}" dari katalog?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Produk (Ambil Gambar Galeri, Tanpa Kategori, Harga Rupiah) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {editingProduct ? 'Edit Data Produk Praktik' : 'Tambah Produk Baru ke Toko'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* FOTO PRODUK: AMBIL DARI GALERI PERANGKAT */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Foto Produk Praktik
                </label>

                <div className="flex items-center space-x-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                    {image ? (
                      <img src={image} alt="Preview Produk" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Ambil Gambar dari Galeri / Berkas</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadFromGallery}
                      className="hidden"
                    />

                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Atau tempel URL gambar di sini..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kit Multimeter True RMS Industri & Probe Uji"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Harga Asli (Rupiah) & Diskon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Harga Asli (Rp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="1000"
                      min="1000"
                      required
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-9 pr-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                    {formatRupiah(originalPrice)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Diskon Peserta (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">
                    Hemat {discountPercentage}%
                  </span>
                </div>
              </div>

              {/* Box Rangkuman Harga Akhir Bersih */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-blue-900 font-semibold block">Harga Akhir Setelah Diskon:</span>
                  <span className="text-[10px] text-blue-600">Nominal yang ditagihkan kepada peserta</span>
                </div>
                <span className="font-extrabold text-blue-700 font-mono text-sm">
                  {formatRupiah(calculatedFinalPrice)}
                </span>
              </div>

              {/* Stok & Bobot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jumlah Stok Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bobot Paket (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Deskripsi Produk */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Deskripsi & Spesifikasi Produk
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Spesifikasi kelengkapan komponen, sertifikasi kelayakan, dan petunjuk pemakaian..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* Tombol Aksi Form */}
              <div className="pt-2 flex justify-end space-x-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
