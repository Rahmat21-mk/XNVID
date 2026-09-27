import {
  User,
  VideoItem,
  ProductItem,
  DeliveryServiceConfig,
  PaymentSettings,
  AppSettings,
  Voucher,
  Order,
  VideoWatchLog
} from '../types';

export const INITIAL_APP_SETTINGS: AppSettings = {
  appName: 'Elearning XNVD',
  appLogoUrl: '',
  adminSignerName: 'Capt. Hendra Wijaya, M.Sc.',
  adminSignerTitle: 'Kepala Pusat Pelatihan & Logistik Sertifikasi',
  adminSignatureType: 'qrcode',
  adminSignatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70"><path d="M 20 45 Q 40 10, 60 40 T 100 20 T 140 45 Q 160 55, 180 30 T 200 45" fill="none" stroke="%230F172A" stroke-width="2.5" stroke-linecap="round"/></svg>',
  supportEmail: 'bantuan@xnvd.id',
  companyAddress: 'Pusat Pelatihan Teknis XNVD, Menara Industri Lt. 8, Jakarta',
};

// Hanya 1 akun admin tunggal yang permanen untuk mengelola semuanya
export const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    name: 'Administrator Utama XNVD',
    email: 'admin@xnvd.id',
    role: 'admin',
    password: 'admin',
    registeredAt: '2026-01-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  }
];

// Tepat 20 video pelatihan dengan durasi antara 5 sampai 20 menit (300 hingga 1200 detik)
export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'VID-001',
    title: 'Modul 01: Dasar Keselamatan Kerja Industri & Standar APD',
    description: 'Panduan lengkap regulasi keselamatan area kerja dan penggunaan APD wajib.',
    category: 'Keselamatan Kerja',
    durationSeconds: 385, // 06:25
    durationFormatted: '06:25',
    thumbnail: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-01',
    fileSizeMb: 142.5,
    uploadedBy: 'admin',
    viewsCount: 248,
    checksum: 'CHK-VID-001-A9F3'
  },
  {
    id: 'VID-002',
    title: 'Modul 02: Prosedur Lockout / Tagout (LOTO) Isolasi Energi',
    description: 'Prosedur standar verifikasi energi nol sebelum perbaikan mekanikal dan elektrikal.',
    category: 'Keselamatan Kerja',
    durationSeconds: 520, // 08:40
    durationFormatted: '08:40',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-02',
    fileSizeMb: 188.0,
    uploadedBy: 'admin',
    viewsCount: 212,
    checksum: 'CHK-VID-002-B8E2'
  },
  {
    id: 'VID-003',
    title: 'Modul 03: Diagnostik Multimeter Digital & Pengukuran Tegangan Aman',
    description: 'Penggunaan multimeter True-RMS, uji kontinuitas, dan pengukuran tegangan tinggi.',
    category: 'Sistem Kelistrikan',
    durationSeconds: 710, // 11:50
    durationFormatted: '11:50',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-03',
    fileSizeMb: 245.2,
    uploadedBy: 'admin',
    viewsCount: 195,
    checksum: 'CHK-VID-003-C7D1'
  },
  {
    id: 'VID-004',
    title: 'Modul 04: Pengkabelan Motor Induksi 3 Fasa & Starter Star-Delta',
    description: 'Konfigurasi blok terminal motor, kalibrasi relay beban lebih, dan starter motor.',
    category: 'Sistem Kelistrikan',
    durationSeconds: 840, // 14:00
    durationFormatted: '14:00',
    thumbnail: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-04',
    fileSizeMb: 310.8,
    uploadedBy: 'admin',
    viewsCount: 178,
    checksum: 'CHK-VID-004-D6C0'
  },
  {
    id: 'VID-005',
    title: 'Modul 05: Dasar Pemrograman PLC Ladder Logic (IEC 61131-3)',
    description: 'Pembuatan diagram tangga PLC, relay internal, timer, counter, dan sistem latching.',
    category: 'Otomasi & PLC',
    durationSeconds: 960, // 16:00
    durationFormatted: '16:00',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-05',
    fileSizeMb: 360.4,
    uploadedBy: 'admin',
    viewsCount: 304,
    checksum: 'CHK-VID-005-E5B9'
  },
  {
    id: 'VID-006',
    title: 'Modul 06: Perakitan Aktuator Pneumatik & Katup Solenoid 5/2',
    description: 'Unit persiapan udara, selang bertekanan, dan perbaikan katup arah pneumatik.',
    category: 'Mekatronika',
    durationSeconds: 430, // 07:10
    durationFormatted: '07:10',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-06',
    fileSizeMb: 162.0,
    uploadedBy: 'admin',
    viewsCount: 165,
    checksum: 'CHK-VID-006-F4A8'
  },
  {
    id: 'VID-007',
    title: 'Modul 07: Regulasi Tekanan Sirkuit Hidrolik & Katup Pengaman',
    description: 'Prinsip unit tenaga hidrolik, katup pelepas tekanan, dan pengurasan akumulator.',
    category: 'Mekatronika',
    durationSeconds: 780, // 13:00
    durationFormatted: '13:00',
    thumbnail: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-07',
    fileSizeMb: 285.5,
    uploadedBy: 'admin',
    viewsCount: 142,
    checksum: 'CHK-VID-007-G397'
  },
  {
    id: 'VID-008',
    title: 'Modul 08: Kinematika Lengan Robotik 6-Axis & Point Teaching',
    description: 'Mode gerak robot, koordinat kerja, serta parameter pencegahan tabrakan robot.',
    category: 'Robotika',
    durationSeconds: 1050, // 17:30
    durationFormatted: '17:30',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-08',
    fileSizeMb: 420.1,
    uploadedBy: 'admin',
    viewsCount: 289,
    checksum: 'CHK-VID-008-H286'
  },
  {
    id: 'VID-009',
    title: 'Modul 09: Kalibrasi Sensor Industri (Induktif, Optik & RTD)',
    description: 'Kalibrasi nol dan rentang transmiter suhu, loop 4-20mA, dan sensor proximity.',
    category: 'Otomasi & PLC',
    durationSeconds: 620, // 10:20
    durationFormatted: '10:20',
    thumbnail: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-09',
    fileSizeMb: 230.0,
    uploadedBy: 'admin',
    viewsCount: 198,
    checksum: 'CHK-VID-009-J175'
  },
  {
    id: 'VID-010',
    title: 'Modul 10: Antarmuka Sistem SCADA & Penanganan Alarm Operasional',
    description: 'Pemantauan layar HMI, pencatatan tren historis, dan penanganan alarm darurat.',
    category: 'Otomasi & PLC',
    durationSeconds: 540, // 09:00
    durationFormatted: '09:00',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-10',
    fileSizeMb: 199.3,
    uploadedBy: 'admin',
    viewsCount: 220,
    checksum: 'CHK-VID-010-K064'
  },
  {
    id: 'VID-011',
    title: 'Modul 11: Penanganan B3 & Prosedur Tumpahan Kimia Darurat',
    description: 'Interpretasi lembar data keselamatan (MSDS) dan pembersihan tumpahan bahan kimia.',
    category: 'Keselamatan Kerja',
    durationSeconds: 490, // 08:10
    durationFormatted: '08:10',
    thumbnail: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-11',
    fileSizeMb: 175.6,
    uploadedBy: 'admin',
    viewsCount: 133,
    checksum: 'CHK-VID-011-L953'
  },
  {
    id: 'VID-012',
    title: 'Modul 12: Pengukuran Presisi Mikrometer & Jangka Sorong Vernier',
    description: 'Teknik pengukuran metrologi, toleransi dimensi benda kerja, dan kalibrasi alat.',
    category: 'Kualitas & Metrologi',
    durationSeconds: 340, // 05:40
    durationFormatted: '05:40',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-12',
    fileSizeMb: 125.8,
    uploadedBy: 'admin',
    viewsCount: 184,
    checksum: 'CHK-VID-012-M842'
  },
  {
    id: 'VID-013',
    title: 'Modul 13: Konfigurasi Parameter Inverter VFD untuk Kontrol Motor',
    description: 'Pengaturan kurva akselerasi, pengereman dinamis, dan parameter komunikasi Modbus.',
    category: 'Sistem Kelistrikan',
    durationSeconds: 890, // 14:50
    durationFormatted: '14:50',
    thumbnail: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-13',
    fileSizeMb: 328.0,
    uploadedBy: 'admin',
    viewsCount: 172,
    checksum: 'CHK-VID-013-N731'
  },
  {
    id: 'VID-014',
    title: 'Modul 14: Diagnostik Jaringan Komunikasi Industri Profinet & Ethernet',
    description: 'Pemasangan konektor RJ45 terlindung dan pelacakan gangguan kabel komunikasi pabrik.',
    category: 'Operasi Digital',
    durationSeconds: 670, // 11:10
    durationFormatted: '11:10',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-14',
    fileSizeMb: 240.4,
    uploadedBy: 'admin',
    viewsCount: 205,
    checksum: 'CHK-VID-014-P620'
  },
  {
    id: 'VID-015',
    title: 'Modul 15: Penyelarasan Poros Gearbox & Pengukuran Laser Shaft',
    description: 'Koreksi ketidaksejajaran sudut dan paralel pada kopling mesin industri.',
    category: 'Mekatronika',
    durationSeconds: 1140, // 19:00
    durationFormatted: '19:00',
    thumbnail: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-15',
    fileSizeMb: 450.0,
    uploadedBy: 'admin',
    viewsCount: 154,
    checksum: 'CHK-VID-015-Q519'
  },
  {
    id: 'VID-016',
    title: 'Modul 16: Sistem Proteksi Kebakaran Gedung & Penanganan APAR',
    description: 'Cara kerja instalasi sprinkler dan penggunaan tabung pemadam api CO2 serta serbuk.',
    category: 'Keselamatan Kerja',
    durationSeconds: 410, // 06:50
    durationFormatted: '06:50',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-16',
    fileSizeMb: 150.2,
    uploadedBy: 'admin',
    viewsCount: 189,
    checksum: 'CHK-VID-016-R408'
  },
  {
    id: 'VID-017',
    title: 'Modul 17: Penerapan Gateway IoT Edge & Telemetri Sensor MQTT',
    description: 'Menghubungkan sensor getaran mesin ke sistem cloud telemetri melalui protokol MQTT.',
    category: 'Operasi Digital',
    durationSeconds: 760, // 12:40
    durationFormatted: '12:40',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-17',
    fileSizeMb: 275.9,
    uploadedBy: 'admin',
    viewsCount: 267,
    checksum: 'CHK-VID-017-S397'
  },
  {
    id: 'VID-018',
    title: 'Modul 18: Verifikasi G-Code Mesin CNC & Optimasi Lintasan Pahat',
    description: 'Uji jalan kering (dry run), pemantauan beban spindel, dan verifikasi koordinat potong.',
    category: 'Kualitas & Metrologi',
    durationSeconds: 980, // 16:20
    durationFormatted: '16:20',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-18',
    fileSizeMb: 370.0,
    uploadedBy: 'admin',
    viewsCount: 161,
    checksum: 'CHK-VID-018-T286'
  },
  {
    id: 'VID-019',
    title: 'Modul 19: Filtrasi Udara Ruang Bersih (HEPA) & Pengujian Partikel',
    description: 'Pemeriksaan tekanan udara bertingkat dan standar klasifikasi kebersihan partikel.',
    category: 'Kualitas & Metrologi',
    durationSeconds: 580, // 09:40
    durationFormatted: '09:40',
    thumbnail: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-19',
    fileSizeMb: 215.1,
    uploadedBy: 'admin',
    viewsCount: 139,
    checksum: 'CHK-VID-019-U175'
  },
  {
    id: 'VID-020',
    title: 'Modul 20: Panduan Pelaksanaan Uji Kompetensi Praktik Akhir',
    description: 'Petunjuk praktikum fisik di laboratorium dan kriteria penilaian kelulusan peserta.',
    category: 'Keselamatan Kerja',
    durationSeconds: 450, // 07:30
    durationFormatted: '07:30',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    uploadDate: '2026-02-20',
    fileSizeMb: 165.7,
    uploadedBy: 'admin',
    viewsCount: 412,
    checksum: 'CHK-VID-020-V064'
  },
];

// Bahan dan peralatan praktik yang tersedia di toko
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'PROD-001',
    name: 'Kit Multimeter Digital True RMS & Kabel Uji Tegangan Bersertifikat',
    originalPrice: 1200000,
    discountPercentage: 25,
    finalPrice: 900000,
    quantity: 35,
    description: 'Multimeter True RMS 6000-count lengkap dengan probe CAT III 1000V, sensor suhu termokopel, dan wadah pelindung.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-ELEC-DMM-01',
    weightKg: 1.2
  },
  {
    id: 'PROD-002',
    name: 'Set Stasiun Kunci Keselamatan Lockout/Tagout (LOTO) Lengkap',
    originalPrice: 850000,
    discountPercentage: 20,
    finalPrice: 680000,
    quantity: 48,
    description: 'Set gembok keselamatan industri (4 gembok kunci berbeda), pengunci saklar MCB, klem katup, dan 25 label peringatan.',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-SAFE-LOTO-02',
    weightKg: 2.1
  },
  {
    id: 'PROD-003',
    name: 'Papan Modul Trainer PLC Ringkas dengan Output Relay & Modbus',
    originalPrice: 3500000,
    discountPercentage: 15,
    finalPrice: 2975000,
    quantity: 16,
    description: 'Rig pengujian PLC edukasi dengan 8 input digital, 6 output transistor, 2 potensiometer analog, dan catu daya 24V DC.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-AUTO-PLC-03',
    weightKg: 3.5
  },
  {
    id: 'PROD-004',
    name: 'Paket Starter Selang Cepat & Katup Pneumatik Praktik',
    originalPrice: 650000,
    discountPercentage: 10,
    finalPrice: 585000,
    quantity: 28,
    description: 'Selang poliuretan 6mm (panjang 20m), sambungan cepat (push-in), katup pengatur aliran, dan katup tuas 5/2.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-MECH-PNEU-04',
    weightKg: 1.8
  },
  {
    id: 'PROD-005',
    name: 'Perangkat Ukur Metrologi Presisi Jangka Sorong Digital & Mikrometer',
    originalPrice: 1100000,
    discountPercentage: 30,
    finalPrice: 770000,
    quantity: 22,
    description: 'Jangka sorong baja tahan karat 0-150mm (akurasi 0.01mm), mikrometer luar 0-25mm, dan blok kalibrasi standar.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-QUAL-METR-05',
    weightKg: 1.4
  },
  {
    id: 'PROD-006',
    name: 'Paket APD Pelindung Busur Api Listrik & Bahan Kimia Peserta',
    originalPrice: 1600000,
    discountPercentage: 20,
    finalPrice: 1280000,
    quantity: 40,
    description: 'Sarung tangan isolasi listrik 1000V, pelindung wajah polikarbonat, celemek antistatis, dan respirator uap organik.',
    image: 'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-SAFE-PPE-06',
    weightKg: 2.8
  },
  {
    id: 'PROD-007',
    name: 'Kit Node Sensor Industri IoT (Suhu, Getaran & Arus Listrik)',
    originalPrice: 1950000,
    discountPercentage: 18,
    finalPrice: 1599000,
    quantity: 19,
    description: 'Modul kontroler industri dengan transceiver RS485, sensor arus CT, amplifier RTD PT100, dan akselerometer getaran.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-DIGI-SENS-07',
    weightKg: 0.9
  },
  {
    id: 'PROD-008',
    name: 'Kit Eksperimen Kinematika Lengan Robotik Mikro Servo',
    originalPrice: 1400000,
    discountPercentage: 15,
    finalPrice: 1190000,
    quantity: 25,
    description: 'Struktur sambungan aluminium lengan robot 3-DOF, motor servo torsi tinggi, konsol joystick kendali manual.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-ROBO-ARML-08',
    weightKg: 2.3
  }
];

export const INITIAL_DELIVERY_SERVICES: DeliveryServiceConfig[] = [
  {
    id: 'DEL-01',
    name: 'Logistik Terpantau XNVD (Standar Aman)',
    code: 'XNVD-MONITOR-STD',
    baseFee: 15000,
    estimatedDays: '2 - 3 Hari Kerja',
    active: true,
    securityInspectionIncluded: true,
  },
  {
    id: 'DEL-02',
    name: 'Kurir Prioritas Segel Keamanan (Express)',
    code: 'PRIORITY-SECURE-EXP',
    baseFee: 25000,
    estimatedDays: '1 Hari Kerja (Besok Sampai)',
    active: true,
    securityInspectionIncluded: true,
  },
  {
    id: 'DEL-03',
    name: 'Kargo Khusus Peralatan Berat Nasional',
    code: 'CARGO-HEAVY-NAT',
    baseFee: 40000,
    estimatedDays: '3 - 5 Hari Kerja',
    active: true,
    securityInspectionIncluded: true,
  }
];

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  adminFee: 2500,
  serviceFee: 1500,
  taxPercentage: 0,
  virtualAccountBanks: [
    { id: 'bca', bankName: 'Bank Central Asia (BCA)', bankCode: '014', accountPrefix: '80922', active: true },
    { id: 'mandiri', bankName: 'Bank Mandiri', bankCode: '008', accountPrefix: '89104', active: true },
    { id: 'bni', bankName: 'Bank Negara Indonesia (BNI)', bankCode: '009', accountPrefix: '98821', active: true },
    { id: 'bri', bankName: 'Bank Rakyat Indonesia (BRI)', bankCode: '002', accountPrefix: '12890', active: true },
  ],
  qrisMerchantName: 'TOKO PRAKTIK ELEARNING XNVD',
  qrisNmid: 'ID1020304050607',
  qrisCustomImageUrl: '',
  manualBankName: 'Bank Central Asia (BCA)',
  manualBankAccount: '528-900-2411',
  manualBankHolder: 'PT XNVD PENDIDIKAN DAN LOGISTIK',
  invoicePrefix: 'INV/2026/XNVD',
  receiptPrefix: 'KWT/2026/XNVD',
  warehouseSlipPrefix: 'SJ/2026/GUDANG',
};

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: 'XNVD20',
    discountPercentage: 20,
    minPurchase: 500000,
    description: 'Diskon 20% untuk pembelian peralatan di atas Rp 500.000',
    expiresAt: '2026-12-31'
  },
  {
    code: 'TRAINEE50',
    discountPercentage: 50,
    minPurchase: 1000000,
    description: 'Subsidi 50% untuk pengadaan kit laboratorium di atas Rp 1.000.000',
    expiresAt: '2026-12-31'
  },
  {
    code: 'WELCOME10',
    discountPercentage: 10,
    minPurchase: 200000,
    description: 'Diskon selamat datang 10% untuk transaksi di atas Rp 200.000',
    expiresAt: '2026-12-31'
  }
];

// Data pemantauan durasi video peserta (tercatat otomatis secara tersembunyi saat peserta menonton)
export const INITIAL_WATCH_LOGS: Record<string, VideoWatchLog[]> = {};

// Data pesanan peserta (tercatat otomatis saat peserta bertransaksi di toko)
export const INITIAL_ORDERS: Order[] = [];
