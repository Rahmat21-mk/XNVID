/**
 * Format angka ke mata uang Rupiah Indonesia (IDR)
 * Contoh: 150000 -> "Rp 150.000"
 */
export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(Math.round(amount));
};
