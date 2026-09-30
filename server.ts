import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  INITIAL_APP_SETTINGS,
  INITIAL_USERS,
  INITIAL_VIDEOS,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_SERVICES,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_VOUCHERS
} from './src/data/seedData';
import {
  User,
  VideoItem,
  ProductItem,
  Order,
  DeliveryServiceConfig,
  PaymentSettings,
  AppSettings,
  Voucher,
  VideoWatchLog,
  OrderStatus
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerDbState {
  adminUser: User;
  users: User[];
  videos: VideoItem[];
  products: ProductItem[];
  deliveryServices: DeliveryServiceConfig[];
  paymentSettings: PaymentSettings;
  appSettings: AppSettings;
  vouchers: Voucher[];
  orders: Order[];
  watchLogs: Record<string, VideoWatchLog[]>;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'app_state.json');

// Direktori untuk penyimpanan berkas unggahan nyata (video dan thumbnail hasil tangkapan)
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const VIDEOS_UPLOAD_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBS_UPLOAD_DIR = path.join(UPLOADS_DIR, 'thumbnails');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_UPLOAD_DIR)) fs.mkdirSync(VIDEOS_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(THUMBS_UPLOAD_DIR)) fs.mkdirSync(THUMBS_UPLOAD_DIR, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, VIDEOS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    cb(null, `${cleanBase}_${unique}${ext}`);
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 1024 * 1024 * 500 } // batas hingga 500MB
});

// Akun admin resmi tunggal yang permanen
const DEFAULT_PERMANENT_ADMIN: User = {
  id: 'admin',
  name: 'Administrator Utama XNVD',
  email: 'admin@xnvd.id',
  role: 'admin',
  password: 'admin', // Default awal, dapat diganti oleh admin di menu Pengaturan
  registeredAt: '2026-01-01T08:00:00Z',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

function loadDatabase(): ServerDbState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Pastikan adminUser selalu ada dan valid
      if (!parsed.adminUser || parsed.adminUser.role !== 'admin') {
        parsed.adminUser = DEFAULT_PERMANENT_ADMIN;
      }
      // Pastikan users menyertakan adminUser dan akun peserta bawaan
      if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = INITIAL_USERS;
      } else {
        const hasAdmin = parsed.users.some((u: User) => u.id === parsed.adminUser.id && u.role === 'admin');
        if (!hasAdmin) {
          parsed.users.unshift(parsed.adminUser);
        }
        const hasTrainee = parsed.users.some((u: User) => u.role === 'trainee');
        if (!hasTrainee) {
          parsed.users.push(INITIAL_USERS[1]);
        }
      }

      // Pastikan selalu ada modul video pelatihan untuk peserta
      if (!Array.isArray(parsed.videos) || parsed.videos.length === 0) {
        parsed.videos = INITIAL_VIDEOS;
      }

      // Pastikan selalu ada produk peralatan praktik untuk peserta
      if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
        parsed.products = INITIAL_PRODUCTS;
      }

      saveDatabase(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database file, initializing clean state:', err);
  }

  // Database awal lengkap dengan 20 modul video industri dan katalog alat bersertifikat
  const initialState: ServerDbState = {
    adminUser: DEFAULT_PERMANENT_ADMIN,
    users: INITIAL_USERS,
    videos: INITIAL_VIDEOS,
    products: INITIAL_PRODUCTS,
    deliveryServices: INITIAL_DELIVERY_SERVICES,
    paymentSettings: INITIAL_PAYMENT_SETTINGS,
    appSettings: INITIAL_APP_SETTINGS,
    vouchers: INITIAL_VOUCHERS,
    orders: [],
    watchLogs: {}
  };

  saveDatabase(initialState);
  return initialState;
}

function saveDatabase(state: ServerDbState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  let db = loadDatabase();

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static serving untuk folder uploads agar video dan thumbnail frame dapat diakses oleh semua peserta
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ================= API ENDPOINTS =================

  // 0. Unggah Berkas Video Asli ke Server
  app.post('/api/upload/video', uploadVideo.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Tidak ada file video yang dikirim.' });
    }
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    res.json({
      success: true,
      videoUrl,
      filename: req.file.originalname,
      size: req.file.size
    });
  });

  // 0b. Unggah Gambar Cuplikan (Thumbnail dari menit pertengahan)
  app.post('/api/upload/thumbnail', (req, res) => {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'Data gambar thumbnail tidak valid.' });
    }
    try {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ success: false, error: 'Format data URL tidak valid.' });
      }
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `thumb_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(THUMBS_UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      res.json({ success: true, thumbnailUrl: `/uploads/thumbnails/${filename}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal menyimpan thumbnail.' });
    }
  });

  // 1. Ambil seluruh state tersentralisasi
  app.get('/api/state', (req, res) => {
    // Sembunyikan password peserta bila ada, tapi biarkan admin dicek via endpoint terpisah
    const sanitizedUsers = db.users.map(u => ({
      ...u,
      password: u.role === 'admin' ? undefined : undefined
    }));

    res.json({
      success: true,
      appSettings: db.appSettings,
      users: sanitizedUsers,
      videos: db.videos,
      products: db.products,
      deliveryServices: db.deliveryServices,
      paymentSettings: db.paymentSettings,
      vouchers: db.vouchers,
      orders: db.orders,
      watchLogs: db.watchLogs,
      adminInfo: {
        id: db.adminUser.id,
        name: db.adminUser.name,
        email: db.adminUser.email
      }
    });
  });

  // 2. Login Peserta (Hanya butuh 6-digit ID)
  app.post('/api/auth/trainee-login', (req, res) => {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'ID Peserta tidak boleh kosong.' });
    }

    const cleanId = id.trim();
    const found = db.users.find(u => u.id === cleanId && u.role === 'trainee');

    if (!found) {
      return res.status(404).json({
        success: false,
        error: `Nomor ID #${cleanId} tidak ditemukan. Silakan lakukan pendaftaran akun baru terlebih dahulu.`
      });
    }

    res.json({ success: true, user: found });
  });

  // 3. Pendaftaran Peserta Baru (ID 6-digit otomatis, tanpa password & departemen)
  app.post('/api/auth/trainee-register', (req, res) => {
    const { name, email } = req.body;
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Nama lengkap peserta wajib diisi.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Alamat email tidak valid.' });
    }

    // Periksa apakah email sudah terdaftar
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'trainee');
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Email sudah terdaftar dengan ID #${existing.id}. Silakan masuk menggunakan nomor ID tersebut.`,
        existingId: existing.id
      });
    }

    // Buat 6-digit ID acak yang unik
    let generatedId = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 1000) {
      attempts++;
      generatedId = Math.floor(100000 + Math.random() * 900000).toString();
      if (!db.users.some(u => u.id === generatedId)) {
        isUnique = true;
      }
    }

    const newTrainee: User = {
      id: generatedId,
      name: cleanName,
      email: cleanEmail,
      role: 'trainee',
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`
    };

    db.users.push(newTrainee);
    saveDatabase(db);

    res.json({ success: true, user: newTrainee, generatedId });
  });

  // 4. Login Admin (ID & Password, Hanya 1 Akun Tunggal yang Permanen)
  app.post('/api/auth/admin-login', (req, res) => {
    const { id, password } = req.body;
    const cleanId = (id || '').trim().toLowerCase();
    const cleanPassword = password || '';

    const matchId =
      cleanId === db.adminUser.id.toLowerCase() ||
      cleanId === db.adminUser.email.toLowerCase() ||
      cleanId === 'admin';

    if (!matchId) {
      return res.status(401).json({ success: false, error: 'ID Administrator tidak ditemukan.' });
    }

    if (cleanPassword !== db.adminUser.password) {
      return res.status(401).json({ success: false, error: 'Kata sandi administrator salah.' });
    }

    res.json({ success: true, user: db.adminUser });
  });

  // 5. Ubah Kredensial Administrator (Ganti ID & Password oleh Admin)
  app.post('/api/auth/update-admin-credentials', (req, res) => {
    const { currentPassword, newId, newPassword, newName, newEmail } = req.body;

    if (currentPassword !== db.adminUser.password) {
      return res.status(403).json({ success: false, error: 'Kata sandi saat ini tidak cocok.' });
    }

    if (newId && newId.trim()) {
      db.adminUser.id = newId.trim();
    }
    if (newPassword && newPassword.trim()) {
      db.adminUser.password = newPassword.trim();
    }
    if (newName && newName.trim()) {
      db.adminUser.name = newName.trim();
    }
    if (newEmail && newEmail.trim()) {
      db.adminUser.email = newEmail.trim();
    }

    // Perbarui juga dalam daftar users
    db.users = [
      db.adminUser,
      ...db.users.filter(u => u.role !== 'admin')
    ];

    saveDatabase(db);
    res.json({ success: true, user: db.adminUser });
  });

  // 6. Cari ID Peserta Berdasarkan Email (Lupa ID)
  app.post('/api/auth/lookup-id', (req, res) => {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const match = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'trainee');
    if (!match) {
      return res.status(404).json({ success: false, error: 'Tidak ditemukan peserta dengan alamat email tersebut.' });
    }

    res.json({ success: true, id: match.id, name: match.name });
  });

  // 7. Reset ID Peserta oleh Admin
  app.post('/api/participants/reset-id', (req, res) => {
    const { oldId, newId } = req.body;
    const cleanOld = (oldId || '').trim();
    const cleanNew = (newId || '').trim();

    if (!/^\d{6}$/.test(cleanNew)) {
      return res.status(400).json({ success: false, error: 'ID baru harus berupa 6 digit angka.' });
    }

    if (db.users.some(u => u.id === cleanNew && u.id !== cleanOld)) {
      return res.status(409).json({ success: false, error: `ID #${cleanNew} sudah digunakan oleh peserta lain.` });
    }

    const traineeIdx = db.users.findIndex(u => u.id === cleanOld && u.role === 'trainee');
    if (traineeIdx === -1) {
      return res.status(404).json({ success: false, error: 'Peserta tidak ditemukan.' });
    }

    db.users[traineeIdx].id = cleanNew;

    // Pindahkan log pemantauan jika ada
    if (db.watchLogs[cleanOld]) {
      db.watchLogs[cleanNew] = db.watchLogs[cleanOld];
      delete db.watchLogs[cleanOld];
    }

    // Perbarui riwayat pesanan peserta
    db.orders.forEach(o => {
      if (o.traineeId === cleanOld) {
        o.traineeId = cleanNew;
      }
    });

    saveDatabase(db);
    res.json({ success: true, user: db.users[traineeIdx] });
  });

  // 8. Hapus Akun Peserta oleh Admin
  app.delete('/api/participants/:id', (req, res) => {
    const { id } = req.params;
    if (id === db.adminUser.id) {
      return res.status(403).json({ success: false, error: 'Akun administrator tidak boleh dihapus.' });
    }

    db.users = db.users.filter(u => u.id !== id);
    delete db.watchLogs[id];
    saveDatabase(db);
    res.json({ success: true });
  });

  // 9. Rekam Durasi Tonton Aktif Peserta (Discreet Tracking)
  app.post('/api/watch-progress', (req, res) => {
    const {
      traineeId,
      videoId,
      videoTitle,
      watchedSecondsIncrement,
      currentPositionSeconds,
      isSkipped,
      durationSeconds
    } = req.body;

    if (!traineeId || !videoId) {
      return res.status(400).json({ success: false, error: 'Parameter tidak lengkap.' });
    }

    if (!db.watchLogs[traineeId]) {
      db.watchLogs[traineeId] = [];
    }

    const traineeLogs = db.watchLogs[traineeId];
    const logIdx = traineeLogs.findIndex(l => l.videoId === videoId);

    const now = new Date().toISOString();
    const durSecs = durationSeconds || 600;

    if (logIdx === -1) {
      const watched = Math.min(durSecs, Math.max(0, watchedSecondsIncrement || 0));
      traineeLogs.push({
        videoId,
        videoTitle: videoTitle || 'Modul Pelatihan',
        durationSeconds: durSecs,
        watchedSeconds: watched,
        watchPercentage: Math.min(100, Math.round((watched / durSecs) * 100)),
        lastWatchedAt: now,
        completionCount: watched >= durSecs * 0.85 ? 1 : 0,
        seekSkipsDetected: isSkipped ? 1 : 0
      });
    } else {
      const currentLog = traineeLogs[logIdx];
      const newWatched = Math.min(durSecs, currentLog.watchedSeconds + (watchedSecondsIncrement || 0));
      currentLog.watchedSeconds = newWatched;
      currentLog.watchPercentage = Math.min(100, Math.round((newWatched / durSecs) * 100));
      currentLog.lastWatchedAt = now;
      if (isSkipped) {
        currentLog.seekSkipsDetected = (currentLog.seekSkipsDetected || 0) + 1;
      }
      if (newWatched >= durSecs * 0.85 && currentLog.completionCount === 0) {
        currentLog.completionCount = 1;
      }
    }

    saveDatabase(db);
    res.json({ success: true, logs: db.watchLogs[traineeId] });
  });

  // 10. Pembuatan Pesanan Baru
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Keranjang belanja kosong.' });
    }

    const orderCount = db.orders.length + 1;
    const padCount = orderCount.toString().padStart(4, '0');

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      orderNumber: `XNVD-ORD-${padCount}`,
      invoiceNumber: `${db.paymentSettings.invoicePrefix}/${padCount}`,
      receiptNumber: `${db.paymentSettings.receiptPrefix}/${padCount}`,
      warehouseSlipNumber: `${db.paymentSettings.warehouseSlipPrefix}/${padCount}`,
      createdAt: new Date().toISOString(),
      adminSignerName: db.appSettings.adminSignerName,
      adminSignatureUrl: db.appSettings.adminSignatureDataUrl
    };

    // Kurangi kuantitas produk di database
    newOrder.items.forEach(it => {
      const prod = db.products.find(p => p.id === it.product.id);
      if (prod) {
        prod.quantity = Math.max(0, prod.quantity - it.quantity);
      }
    });

    db.orders.unshift(newOrder);
    saveDatabase(db);
    res.json({ success: true, order: newOrder });
  });

  // 11. Perbarui Status Pesanan & Nomor Resi
  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, checkpointNote, customTrackingCode } = req.body;

    const ord = db.orders.find(o => o.id === id);
    if (!ord) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
    }

    ord.status = status as OrderStatus;
    if (customTrackingCode) {
      ord.trackingNumber = customTrackingCode.trim();
    }

    const statusTitleMap: Record<string, string> = {
      paid_packing: 'Pemeriksaan Mutu & Segel Pengaman',
      in_transit: 'Paket Berangkat Menuju Alamat Peserta',
      delivered: 'Paket Berhasil Diterima Peserta',
      cancelled: 'Pesanan Dibatalkan'
    };

    ord.trackingSteps.push({
      status,
      title: statusTitleMap[status] || 'Pembaruan Ekspedisi Logistik',
      description: checkpointNote || `Status pengiriman diperbarui menjadi: ${status}.`,
      timestamp: new Date().toISOString(),
      completed: true
    });

    saveDatabase(db);
    res.json({ success: true, order: ord });
  });

  // 12. Tambah / Edit / Hapus Produk
  app.post('/api/products', (req, res) => {
    const data = req.body;
    const original = Number(data.originalPrice) || 0;
    const disc = Number(data.discountPercentage) || 0;
    const finalPrice = Math.max(0, original - (original * (disc / 100)));

    const newProd: ProductItem = {
      ...data,
      id: `PROD-${Date.now().toString().slice(-5)}`,
      sku: `SKU-XNVD-${Math.floor(1000 + Math.random() * 9000)}`,
      finalPrice: Number(finalPrice.toFixed(2))
    };

    db.products.push(newProd);
    saveDatabase(db);
    res.json({ success: true, product: newProd });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const idx = db.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    }

    const original = Number(data.originalPrice ?? db.products[idx].originalPrice);
    const disc = Number(data.discountPercentage ?? db.products[idx].discountPercentage);
    const finalPrice = Math.max(0, original - (original * (disc / 100)));

    db.products[idx] = {
      ...db.products[idx],
      ...data,
      finalPrice: Number(finalPrice.toFixed(2))
    };

    saveDatabase(db);
    res.json({ success: true, product: db.products[idx] });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.products = db.products.filter(p => p.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 13. Tambah / Batch Unggah / Hapus Video Pelatihan
  app.post('/api/videos', (req, res) => {
    const data = req.body;
    const totalSecs = Number(data.durationSeconds) || 600;

    // Filter duplikasi judul video
    const norm = data.title.trim().toLowerCase();
    if (db.videos.some(v => v.title.trim().toLowerCase() === norm)) {
      return res.status(409).json({ success: false, error: 'Video dengan judul yang sama sudah terdaftar.' });
    }

    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);

    const newVideo: VideoItem = {
      ...data,
      id: `VID-${(db.videos.length + 1).toString().padStart(3, '0')}`,
      durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
      uploadDate: new Date().toISOString(),
      viewsCount: 0,
      uploadedBy: db.adminUser.name
    };

    db.videos.unshift(newVideo);
    saveDatabase(db);
    res.json({ success: true, video: newVideo });
  });

  // Batch upload video (minimal 4 video sekaligus hingga 200 video)
  app.post('/api/videos/batch', (req, res) => {
    const { videos: incomingVideos } = req.body;
    if (!Array.isArray(incomingVideos) || incomingVideos.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar video tidak valid.' });
    }

    const addedList: VideoItem[] = [];
    const now = new Date().toISOString();

    for (const data of incomingVideos) {
      const norm = (data.title || '').trim().toLowerCase();
      // Lewati duplikat yang sudah ada di database atau batch saat ini
      if (!norm || db.videos.some(v => v.title.trim().toLowerCase() === norm) || addedList.some(v => v.title.trim().toLowerCase() === norm)) {
        continue;
      }

      const totalSecs = Number(data.durationSeconds) || 600;
      const m = Math.floor(totalSecs / 60);
      const s = Math.floor(totalSecs % 60);

      const videoId = `VID-${(db.videos.length + addedList.length + 1).toString().padStart(3, '0')}`;
      const newVideo: VideoItem = {
        ...data,
        id: videoId,
        durationSeconds: totalSecs,
        durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
        uploadDate: now,
        viewsCount: 0,
        uploadedBy: db.adminUser.name,
        checksum: data.checksum || `CHK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      addedList.push(newVideo);
    }

    if (addedList.length > 0) {
      db.videos = [...addedList, ...db.videos];
      saveDatabase(db);
    }

    res.json({ success: true, count: addedList.length, videos: addedList });
  });

  app.delete('/api/videos/:id', (req, res) => {
    const { id } = req.params;
    db.videos = db.videos.filter(v => v.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Hapus video secara massal (batch delete atau hapus semua video)
  app.post('/api/videos/batch-delete', (req, res) => {
    const { videoIds, deleteAll } = req.body;
    const beforeCount = db.videos.length;

    if (deleteAll === true) {
      db.videos = [];
      saveDatabase(db);
      return res.json({ success: true, count: beforeCount });
    }

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar ID video yang ingin dihapus tidak valid.' });
    }

    const idsSet = new Set(videoIds);
    db.videos = db.videos.filter(v => !idsSet.has(v.id));
    const deletedCount = beforeCount - db.videos.length;
    saveDatabase(db);
    res.json({ success: true, count: deletedCount });
  });

  // 14. Simpan Pengaturan (Aplikasi, Pembayaran, Kurir)
  app.post('/api/settings/app', (req, res) => {
    db.appSettings = { ...db.appSettings, ...req.body };
    saveDatabase(db);
    res.json({ success: true, appSettings: db.appSettings });
  });

  app.post('/api/settings/payment', (req, res) => {
    db.paymentSettings = { ...db.paymentSettings, ...req.body };
    saveDatabase(db);
    res.json({ success: true, paymentSettings: db.paymentSettings });
  });

  app.post('/api/settings/delivery', (req, res) => {
    if (Array.isArray(req.body)) {
      db.deliveryServices = req.body;
      saveDatabase(db);
    }
    res.json({ success: true, deliveryServices: db.deliveryServices });
  });

  // ================= VITE DEV / PROD MIDDLEWARE =================
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Elearning XNVD Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Error:', err);
});
