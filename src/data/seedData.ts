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

// Akun resmi tunggal admin dan akun peserta bawaan siap uji
export const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    name: 'Administrator Utama XNVD',
    email: 'admin@xnvd.id',
    role: 'admin',
    password: 'admin',
    registeredAt: '2026-01-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '104821',
    name: 'Budi Pratama - Peserta Sertifikasi',
    email: 'peserta@xnvd.id',
    role: 'trainee',
    registeredAt: '2026-02-15T09:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  }
];

// Repositori 20 video modul pelatihan resmi standar industri
export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'VID-001',
    title: 'Modul 01: Pengenalan Alat Ukur Multimeter Digital True RMS & Kalibrasi Standar',
    description: 'Panduan lengkap cara mengoperasikan multimeter digital True RMS, pengukuran tegangan AC/DC presisi, pengujian kontinuitas, resistansi, dan kalibrasi nol sebelum pengujian panel.',
    category: 'Materi Praktik',
    durationSeconds: 745,
    durationFormatted: '12m 25d',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    uploadDate: '2026-03-01T08:00:00Z',
    fileSizeMb: 42.5,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 142
  },
  {
    id: 'VID-002',
    title: 'Modul 02: Standar Keselamatan Kerja Listrik & Prosedur LOTO (Lockout/Tagout)',
    description: 'Prosedur isolasi energi berbahaya pada sakelar utama industri, pemasangan gembok keselamatan LOTO, dan pemakaian APD tegangan tinggi standar K3 nasional.',
    category: 'Materi Praktik',
    durationSeconds: 618,
    durationFormatted: '10m 18d',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    uploadDate: '2026-03-01T09:15:00Z',
    fileSizeMb: 36.8,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 128
  },
  {
    id: 'VID-003',
    title: 'Modul 03: Instalasi & Pengawatan Panel Kontrol Motor Induksi 3 Fasa',
    description: 'Praktik langsung perakitan panel tenaga, penataan kabel trunking, pemasangan MCB 3 fasa, kontaktor magnetik, serta thermal overload relay (TOR).',
    category: 'Materi Praktik',
    durationSeconds: 890,
    durationFormatted: '14m 50d',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    uploadDate: '2026-03-02T10:00:00Z',
    fileSizeMb: 51.2,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 115
  },
  {
    id: 'VID-004',
    title: 'Modul 04: Pemrograman Dasar PLC Siemens S7-1200 & Ladder Diagram Logika',
    description: 'Pengenalan software TIA Portal, konfigurasi hardware CPU 1214C, penulisan ladder logic kontak NO/NC, timer TON/TOF, dan counter untuk konveyor otomatis.',
    category: 'Materi Praktik',
    durationSeconds: 960,
    durationFormatted: '16m 00d',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    uploadDate: '2026-03-03T11:20:00Z',
    fileSizeMb: 58.4,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 130
  },
  {
    id: 'VID-005',
    title: 'Modul 05: Wiring & Kalibrasi Sensor Suhu RTD Pt100 & Transmitter 4-20mA',
    description: 'Teknik pengkabelan sensor suhu RTD 3-kawat, konversi sinyal analog ke sinyal arus loop 4-20mA, dan pemetaan nilai ADC pada modul input analog PLC.',
    category: 'Materi Praktik',
    durationSeconds: 705,
    durationFormatted: '11m 45d',
    thumbnail: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    uploadDate: '2026-03-04T08:30:00Z',
    fileSizeMb: 39.7,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 98
  },
  {
    id: 'VID-006',
    title: 'Modul 06: Troubleshooting Rangkaian Daya & Sistem Kontrol Star-Delta Otomatis',
    description: 'Metodologi sistematis pelacakan kerusakan pada kontaktor bintang-segitiga, penyesuaian delay timer transisi, dan proteksi lonjakan arus start motor listrik.',
    category: 'Materi Praktik',
    durationSeconds: 840,
    durationFormatted: '14m 00d',
    thumbnail: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    uploadDate: '2026-03-05T13:45:00Z',
    fileSizeMb: 47.9,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 104
  },
  {
    id: 'VID-007',
    title: 'Modul 07: Pengoperasian Inverter VFD (Variable Frequency Drive) Motor Listrik',
    description: 'Setting parameter frekuensi dasar, kurva akselerasi/deselerasi, wiring terminal kendali digital dan analog potentiometer pada Variable Frequency Drive industri.',
    category: 'Materi Praktik',
    durationSeconds: 795,
    durationFormatted: '13m 15d',
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    uploadDate: '2026-03-06T09:00:00Z',
    fileSizeMb: 45.1,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 95
  },
  {
    id: 'VID-008',
    title: 'Modul 08: Teknik Penyolderan Standar Industri & Rework PCB Komponen Presisi',
    description: 'Standar penyolderan IPC, pengaturan temperatur solder station ESD Safe, penggunaan flux kawat solder timah bebas timbal, dan teknik desoldering pump.',
    category: 'Materi Praktik',
    durationSeconds: 650,
    durationFormatted: '10m 50d',
    thumbnail: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    uploadDate: '2026-03-07T14:10:00Z',
    fileSizeMb: 38.3,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 88
  },
  {
    id: 'VID-009',
    title: 'Modul 09: Kalibrasi & Pembacaan Sinyal Osiloskop Digital 2 Kanal',
    description: 'Langkah pengukuran bentuk gelombang PWM, penyesuaian volt/div, time/div, trigger level, serta analisis noise riak tegangan pada power supply switching.',
    category: 'Materi Praktik',
    durationSeconds: 760,
    durationFormatted: '12m 40d',
    thumbnail: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    uploadDate: '2026-03-08T10:30:00Z',
    fileSizeMb: 43.6,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 112
  },
  {
    id: 'VID-010',
    title: 'Modul 10: Sistem Pneumatik Dasar & Rangkaian Silinder Elektro-Pneumatik',
    description: 'Instalasi katup selenoid 5/2 arah, filter regulator kompresor udara, pengatur kecepatan flow control, dan sensor reed switch posisi silinder pneumatik.',
    category: 'Materi Praktik',
    durationSeconds: 810,
    durationFormatted: '13m 30d',
    thumbnail: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    uploadDate: '2026-03-09T08:45:00Z',
    fileSizeMb: 46.2,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 82
  },
  {
    id: 'VID-011',
    title: 'Modul 11: Pengukuran Tahanan Isolasi Motor Menggunakan Megger 1000V',
    description: 'Standar pengujian ketahanan isolasi belitan stator motor listrik terhadap bodi rangka, pengujian fase-ke-fase, dan batas toleransi kelayakan operasi mesin.',
    category: 'Materi Praktik',
    durationSeconds: 690,
    durationFormatted: '11m 30d',
    thumbnail: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    uploadDate: '2026-03-10T11:00:00Z',
    fileSizeMb: 39.5,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 79
  },
  {
    id: 'VID-012',
    title: 'Modul 12: Desain HMI (Human Machine Interface) & Komunikasi Modbus TCP',
    description: 'Pembuatan layar sentuh operator visualisasi proses produksi, penautan tag variabel PLC, animasi status motor pompa, serta konfigurasi alamat IP Modbus.',
    category: 'Materi Praktik',
    durationSeconds: 920,
    durationFormatted: '15m 20d',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    uploadDate: '2026-03-11T13:20:00Z',
    fileSizeMb: 54.0,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 91
  },
  {
    id: 'VID-013',
    title: 'Modul 13: Pengenalan & Pengujian Relay Proteksi Thermal Overload (TOR)',
    description: 'Kalibrasi arus nominal motor pada dial TOR, pengetesan mekanisme trip manual, fungsi kontak bantu 95-96 normally closed dan 97-98 normally open.',
    category: 'Materi Praktik',
    durationSeconds: 580,
    durationFormatted: '09m 40d',
    thumbnail: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    uploadDate: '2026-03-12T09:30:00Z',
    fileSizeMb: 33.2,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 76
  },
  {
    id: 'VID-014',
    title: 'Modul 14: Praktik Wiring Kontaktor Magnetik & Push Button Interlock Keamanan',
    description: 'Rangkaian pengunci sendiri (self-holding latch), tombol darurat Emergency Stop, rangkaian interlock elektrik bolak-balik motor (Forward-Reverse).',
    category: 'Materi Praktik',
    durationSeconds: 730,
    durationFormatted: '12m 10d',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    uploadDate: '2026-03-13T10:40:00Z',
    fileSizeMb: 41.8,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 89
  },
  {
    id: 'VID-015',
    title: 'Modul 15: Analisis Harmonisa & Pengukuran Kualitas Daya Listrik 3 Fasa',
    description: 'Pemantauan faktor daya (Cos Phi), distorsi harmonisa arus dan tegangan (THD), serta penentuan kapasitor bank kompensasi daya reaktif industri.',
    category: 'Materi Praktik',
    durationSeconds: 865,
    durationFormatted: '14m 25d',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    uploadDate: '2026-03-14T08:15:00Z',
    fileSizeMb: 49.3,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 73
  },
  {
    id: 'VID-016',
    title: 'Modul 16: Pemeliharaan Preventif Panel Distribusi Listrik Tegangan Rendah',
    description: 'Prosedur pembersihan debu busbar isolasi, pengencangan torsi baut terminal kabel, inspeksi visual tanda kelebihan beban panas, dan thermo-scan.',
    category: 'Materi Praktik',
    durationSeconds: 670,
    durationFormatted: '11m 10d',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    uploadDate: '2026-03-15T14:50:00Z',
    fileSizeMb: 38.6,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 84
  },
  {
    id: 'VID-017',
    title: 'Modul 17: Pengkabelan Kontrol Sensor Kedekatan Proximity Induktif & Optik',
    description: 'Perbedaan sensor NPN sinking dan PNP sourcing, penyambungan resistor pull-up/pull-down, dan integrasi input diskrit modul otomasi industri.',
    category: 'Materi Praktik',
    durationSeconds: 635,
    durationFormatted: '10m 35d',
    thumbnail: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    uploadDate: '2026-03-16T11:30:00Z',
    fileSizeMb: 36.2,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 92
  },
  {
    id: 'VID-018',
    title: 'Modul 18: Rangkaian Kontrol Otomatisasi Pemindahan Daya ATS-AMF Genset',
    description: 'Logika kerja modul otomatis transfer switch PLN ke Generator darurat, sensor kegagalan fasa (under/over voltage), dan siklus pendinginan genset.',
    category: 'Materi Praktik',
    durationSeconds: 880,
    durationFormatted: '14m 40d',
    thumbnail: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    uploadDate: '2026-03-17T09:10:00Z',
    fileSizeMb: 50.1,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 78
  },
  {
    id: 'VID-019',
    title: 'Modul 19: Prosedur Pengujian Tahanan Pembumian (Earth Grounding Tester)',
    description: 'Metode 3-titik pengukuran elektroda grounding penangkal petir dan pentanahan netral trafo menggunakan earth tester digital standar PUIL.',
    category: 'Materi Praktik',
    durationSeconds: 610,
    durationFormatted: '10m 10d',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    uploadDate: '2026-03-18T13:00:00Z',
    fileSizeMb: 34.9,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 81
  },
  {
    id: 'VID-020',
    title: 'Modul 20: Standar Dokumentasi Wiring Diagram & Pembacaan Gambar Skematik',
    description: 'Pedoman membaca simbol standar kelistrikan IEC, kode penomoran kabel wire ferrules, tata letak terminal strip, dan penyusunan as-built drawing.',
    category: 'Materi Praktik',
    durationSeconds: 780,
    durationFormatted: '13m 00d',
    thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    uploadDate: '2026-03-19T10:00:00Z',
    fileSizeMb: 44.5,
    uploadedBy: 'Administrator Utama XNVD',
    viewsCount: 110
  }
];

// Bahan dan peralatan praktik toko bersertifikat resmi (Harga Rupiah & Subsidi Khusus Peserta)
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'PROD-01',
    name: 'Multimeter Digital True RMS Auto-Ranging 6000 Counts',
    description: 'Alat ukur tegangan AC/DC presisi tinggi dilengkapi fitur pengujian kapasitansi, frekuensi, temperatur, NCV sensor, dan sertifikat kalibrasi pabrik.',
    category: 'Alat Ukur Listrik',
    originalPrice: 680000,
    discountPercentage: 15,
    finalPrice: 578000,
    quantity: 45,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-MM01',
    weightKg: 0.6
  },
  {
    id: 'PROD-02',
    name: 'Trainer Kit PLC Starter S7-1200 + Power Supply 24V',
    description: 'Modul trainer kompak untuk latihan logika pemrograman PLC industri dilengkapi switch input simulasi, lampu indikator output 24VDC, dan kabel komunikasi.',
    category: 'Modul Praktik Otomasi',
    originalPrice: 4850000,
    discountPercentage: 20,
    finalPrice: 3880000,
    quantity: 18,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-PLC02',
    weightKg: 4.2
  },
  {
    id: 'PROD-03',
    name: 'Osiloskop Digital Portabel 2-Kanal 100MHz Realtime',
    description: 'Osiloskop layar warna TFT 7 inci dengan laju sampel 1GSa/s, memori kedalaman 40K, antarmuka USB host/device untuk penyimpanan data sinyal.',
    category: 'Alat Uji Laboratorium',
    originalPrice: 3750000,
    discountPercentage: 10,
    finalPrice: 3375000,
    quantity: 12,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-OSC03',
    weightKg: 2.8
  },
  {
    id: 'PROD-04',
    name: 'Paket APD Lengkap Teknisi Listrik Helm & Sarung Tangan 1000V',
    description: 'Perlengkapan keselamatan kerja berstandar K3 terdiri dari helm safety V-Gard bersertifikasi ANSI, sarung tangan isolasi karet komposit 1000V, dan kacamata anti-radiasi.',
    category: 'Keselamatan Kerja K3',
    originalPrice: 495000,
    discountPercentage: 10,
    finalPrice: 445500,
    quantity: 60,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-APD04',
    weightKg: 1.2
  },
  {
    id: 'PROD-05',
    name: 'Soldering Station Digital Suhu Terkendali 60W ESD Safe',
    description: 'Solder suhu presisi 200°C - 480°C dengan pemanas keramik tahan lama, dudukan logam dengan spons pembersih, dan ujung solder berlapis nikel.',
    category: 'Peralatan Bengkel',
    originalPrice: 420000,
    discountPercentage: 15,
    finalPrice: 357000,
    quantity: 35,
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-SLD05',
    weightKg: 1.8
  },
  {
    id: 'PROD-06',
    name: 'Set Tang Kombinasi & Obeng Isolasi VDE 1000V (7 Pcs)',
    description: 'Perkakas tangan teknisi berisolasi tahan tegangan 1000V standar DIN EN 60900. Terdiri dari tang kombinasi, tang potong, tang cucut, dan 4 obeng presisi.',
    category: 'Perkakas Tangan',
    originalPrice: 375000,
    discountPercentage: 20,
    finalPrice: 300000,
    quantity: 40,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-TLS06',
    weightKg: 1.5
  },
  {
    id: 'PROD-07',
    name: 'Tang Crimping Skun Kabel Ratchet Presisi Heavy Duty',
    description: 'Tang pres skun ferrule kabel otomatis ukuran 0.25 - 10mm² dengan mekanisme ratchet presisi yang memastikan kompresi kabel kuat dan rapi.',
    category: 'Perkakas Tangan',
    originalPrice: 285000,
    discountPercentage: 10,
    finalPrice: 256500,
    quantity: 50,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-CRM07',
    weightKg: 0.7
  },
  {
    id: 'PROD-08',
    name: 'DC Power Supply Laboratorium Variabel 0-30V 5A Digital',
    description: 'Catu daya bangku laboratorium teregulasi presisi dengan display LED 4 digit untuk monitoring voltase dan arus secara simultan, dilengkapi proteksi short circuit.',
    category: 'Alat Uji Laboratorium',
    originalPrice: 1150000,
    discountPercentage: 12,
    finalPrice: 1012000,
    quantity: 20,
    image: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-PWR08',
    weightKg: 4.5
  },
  {
    id: 'PROD-09',
    name: 'Insulation Resistance Tester Digital (Megger) 1000V',
    description: 'Penguji tahanan isolasi kabel dan motor dengan opsi tegangan injeksi 250V, 500V, dan 1000V. Layar LCD besar dengan backlight dan tombol auto-discharge aman.',
    category: 'Alat Ukur Listrik',
    originalPrice: 1450000,
    discountPercentage: 15,
    finalPrice: 1232500,
    quantity: 15,
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-MEG09',
    weightKg: 1.9
  },
  {
    id: 'PROD-10',
    name: 'Termometer Laser Inframerah Industri -50°C s/d 550°C',
    description: 'Sensor suhu optik non-kontak respons cepat 500ms dengan rasio jarak 12:1 dan laser pointer ganda untuk inspeksi titik panas terminal kabel dan panel daya.',
    category: 'Alat Ukur Listrik',
    originalPrice: 320000,
    discountPercentage: 15,
    finalPrice: 272000,
    quantity: 40,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-THM10',
    weightKg: 0.4
  },
  {
    id: 'PROD-11',
    name: 'Tachometer Digital Laser Non-Kontak RPM Meter Motor',
    description: 'Pengukur kecepatan putaran motor listrik presisi tinggi 2.5 hingga 99.999 RPM dengan stiker reflektor khusus dan memori nilai Max/Min/Last.',
    category: 'Alat Ukur Listrik',
    originalPrice: 290000,
    discountPercentage: 10,
    finalPrice: 261000,
    quantity: 30,
    image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-TAC11',
    weightKg: 0.45
  },
  {
    id: 'PROD-12',
    name: 'Paket Kabel Test Lead Silikon Ekstra Fleksibel 10 Pcs',
    description: 'Set kabel probe laboratorium berkualitas tinggi dengan isolasi silikon tahan panas, konektor banana plug 4mm, dan jepit buaya tembaga murni berselubung.',
    category: 'Peralatan Bengkel',
    originalPrice: 145000,
    discountPercentage: 10,
    finalPrice: 130500,
    quantity: 80,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    sku: 'SKU-XNVD-CAB12',
    weightKg: 0.35
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
