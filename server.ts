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

// Direktori untuk penyimpanan berkas unggahan nyata (video, gambar, dan thumbnail hasil tangkapan)
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const VIDEOS_UPLOAD_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBS_UPLOAD_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const IMAGES_UPLOAD_DIR = path.join(UPLOADS_DIR, 'images');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_UPLOAD_DIR)) fs.mkdirSync(VIDEOS_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(THUMBS_UPLOAD_DIR)) fs.mkdirSync(THUMBS_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_UPLOAD_DIR)) fs.mkdirSync(IMAGES_UPLOAD_DIR, { recursive: true });

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
      if (!parsed.adminUser || parsed.adminUser.role !== 'admin') {
        parsed.adminUser = DEFAULT_PERMANENT_ADMIN;
      }
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

      if (!Array.isArray(parsed.videos)) parsed.videos = [];
      if (!Array.isArray(parsed.products)) parsed.products = [];
      if (!Array.isArray(parsed.orders)) parsed.orders = [];
      if (!parsed.watchLogs) parsed.watchLogs = {};
      if (!parsed.appSettings) parsed.appSettings = INITIAL_APP_SETTINGS;
      if (!parsed.paymentSettings) parsed.paymentSettings = INITIAL_PAYMENT_SETTINGS;
      if (!Array.isArray(parsed.deliveryServices)) parsed.deliveryServices = INITIAL_DELIVERY_SERVICES;
      if (!Array.isArray(parsed.vouchers)) parsed.vouchers = INITIAL_VOUCHERS;
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database file, initializing clean state:', err);
  }

  const initialState: ServerDbState = {
    adminUser: DEFAULT_PERMANENT_ADMIN,
    users: INITIAL_USERS,
    videos: [],
    products: [],
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

function getDb(): ServerDbState {
  return loadDatabase();
}

function updateDb(mutator: (state: ServerDbState) => void): ServerDbState {
  const state = loadDatabase();
  mutator(state);
  saveDatabase(state);
  return state;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware CORS untuk memastikan akses dari seluruh peramban seluler / HP lancar
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static serving untuk folder uploads agar video dan thumbnail frame dapat diakses oleh semua peserta
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ================= API ENDPOINTS =================

  // 0. Unggah Berkas Video Asli ke Server
  app.post('/api/upload/video', (req, res) => {
    uploadVideo.single('video')(req, res, (err: any) => {
      if (err) {
        console.error('Multer video upload error:', err);
        return res.status(400).json({ success: false, error: err.message || 'Gagal mengunggah berkas video.' });
      }
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

  // 0c. Unggah Gambar Produk / Logo ke Server
  app.post('/api/upload/image', (req, res) => {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'Data gambar tidak valid.' });
    }
    try {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ success: false, error: 'Format data URL gambar tidak valid.' });
      }
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
      const filePath = path.join(IMAGES_UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      res.json({ success: true, imageUrl: `/uploads/images/${filename}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Gagal menyimpan gambar.' });
    }
  });

  // 1. Ambil seluruh state tersentralisasi (Selalu membaca data terkini dari disk)
  app.get('/api/state', (_req, res) => {
    const db = getDb();
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

  // 1b. Sinkronisasi Master State Antar-Perangkat (Laptop <-> HP <-> Tablet)
  app.post('/api/state/sync-master', (req, res) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, error: 'Payload sinkronisasi tidak valid.' });
    }

    const updated = updateDb(state => {
      // 1. Pengaturan Aplikasi
      if (incoming.appSettings && typeof incoming.appSettings === 'object') {
        state.appSettings = { ...state.appSettings, ...incoming.appSettings };
      }
      // 2. Pengaturan Pembayaran
      if (incoming.paymentSettings && typeof incoming.paymentSettings === 'object') {
        state.paymentSettings = { ...state.paymentSettings, ...incoming.paymentSettings };
      }
      // 3. Layanan Pengiriman
      if (Array.isArray(incoming.deliveryServices) && incoming.deliveryServices.length > 0) {
        state.deliveryServices = incoming.deliveryServices;
      }
      // 4. Kredensial Administrator
      if (incoming.adminUser && incoming.adminUser.role === 'admin') {
        state.adminUser = { ...state.adminUser, ...incoming.adminUser };
        state.users = [
          state.adminUser,
          ...state.users.filter(u => u.role !== 'admin')
        ];
      }
      // 5. Produk: Gabungkan atau perbarui secara utuh
      if (Array.isArray(incoming.products) && incoming.products.length > 0) {
        const prodMap = new Map(state.products.map(p => [p.id, p]));
        incoming.products.forEach((p: ProductItem) => {
          prodMap.set(p.id, p);
        });
        state.products = Array.from(prodMap.values());
      }
      // 6. Video: Gabungkan agar video yang diunggah dari laptop tersimpan permanen
      if (Array.isArray(incoming.videos) && incoming.videos.length > 0) {
        const vidMap = new Map(state.videos.map(v => [v.id, v]));
        const titles = new Set(state.videos.map(v => v.title.toLowerCase().trim()));
        incoming.videos.forEach((v: VideoItem) => {
          const norm = (v.title || '').toLowerCase().trim();
          if (!vidMap.has(v.id) || !titles.has(norm)) {
            vidMap.set(v.id, v);
            titles.add(norm);
          } else {
            // Update metadata jika ada
            vidMap.set(v.id, { ...vidMap.get(v.id), ...v });
          }
        });
        state.videos = Array.from(vidMap.values());
      }
      // 7. Pengguna / Peserta
      if (Array.isArray(incoming.users) && incoming.users.length > 0) {
        const userMap = new Map(state.users.map(u => [u.id, u]));
        incoming.users.forEach((u: User) => {
          if (!userMap.has(u.id)) {
            userMap.set(u.id, u);
          }
        });
        state.users = Array.from(userMap.values());
      }
      // 8. Pesanan
      if (Array.isArray(incoming.orders) && incoming.orders.length > 0) {
        const orderMap = new Map(state.orders.map(o => [o.id, o]));
        incoming.orders.forEach((o: Order) => {
          orderMap.set(o.id, o);
        });
        state.orders = Array.from(orderMap.values());
      }
      // 9. Watch Logs
      if (incoming.watchLogs && typeof incoming.watchLogs === 'object') {
        Object.keys(incoming.watchLogs).forEach(uid => {
          if (!state.watchLogs[uid]) {
            state.watchLogs[uid] = incoming.watchLogs[uid];
          } else if (Array.isArray(incoming.watchLogs[uid])) {
            const currentLogs = state.watchLogs[uid];
            incoming.watchLogs[uid].forEach((newLog: VideoWatchLog) => {
              const existingIdx = currentLogs.findIndex(l => l.videoId === newLog.videoId);
              if (existingIdx === -1) {
                currentLogs.push(newLog);
              } else if (newLog.watchedSeconds > currentLogs[existingIdx].watchedSeconds) {
                currentLogs[existingIdx] = newLog;
              }
            });
          }
        });
      }
    });

    res.json({
      success: true,
      message: 'Master database berhasil disinkronkan secara permanen ke server.',
      state: updated
    });
  });

  // 2. Login Peserta (Hanya butuh 6-digit ID)
  app.post('/api/auth/trainee-login', (req, res) => {
    const { id } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'ID Peserta tidak boleh kosong.' });
    }

    const cleanId = id.trim();
    const db = getDb();
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

    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'trainee');
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Email sudah terdaftar dengan ID #${existing.id}. Silakan masuk menggunakan nomor ID tersebut.`,
        existingId: existing.id
      });
    }

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

    updateDb(state => {
      state.users.push(newTrainee);
    });

    res.json({ success: true, user: newTrainee, generatedId });
  });

  // 4. Login Admin (ID & Password, Hanya 1 Akun Tunggal yang Permanen)
  app.post('/api/auth/admin-login', (req, res) => {
    const { id, password } = req.body;
    const cleanId = (id || '').trim().toLowerCase();
    const cleanPassword = password || '';
    const db = getDb();

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
    const db = getDb();

    if (currentPassword !== db.adminUser.password) {
      return res.status(403).json({ success: false, error: 'Kata sandi saat ini tidak cocok.' });
    }

    let updatedAdmin: User = db.adminUser;
    updateDb(state => {
      if (newId && newId.trim()) state.adminUser.id = newId.trim();
      if (newPassword && newPassword.trim()) state.adminUser.password = newPassword.trim();
      if (newName && newName.trim()) state.adminUser.name = newName.trim();
      if (newEmail && newEmail.trim()) state.adminUser.email = newEmail.trim();

      state.users = [
        state.adminUser,
        ...state.users.filter(u => u.role !== 'admin')
      ];
      updatedAdmin = state.adminUser;
    });

    res.json({ success: true, user: updatedAdmin });
  });

  // 6. Cari ID Peserta Berdasarkan Email (Lupa ID)
  app.post('/api/auth/lookup-id', (req, res) => {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const db = getDb();

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

    const db = getDb();
    if (db.users.some(u => u.id === cleanNew && u.id !== cleanOld)) {
      return res.status(409).json({ success: false, error: `ID #${cleanNew} sudah digunakan oleh peserta lain.` });
    }

    const traineeIdx = db.users.findIndex(u => u.id === cleanOld && u.role === 'trainee');
    if (traineeIdx === -1) {
      return res.status(404).json({ success: false, error: 'Peserta tidak ditemukan.' });
    }

    let targetUser: User | null = null;
    updateDb(state => {
      const idx = state.users.findIndex(u => u.id === cleanOld && u.role === 'trainee');
      if (idx !== -1) {
        state.users[idx].id = cleanNew;
        targetUser = state.users[idx];
      }
      if (state.watchLogs[cleanOld]) {
        state.watchLogs[cleanNew] = state.watchLogs[cleanOld];
        delete state.watchLogs[cleanOld];
      }
      state.orders.forEach(o => {
        if (o.traineeId === cleanOld) o.traineeId = cleanNew;
      });
    });

    res.json({ success: true, user: targetUser });
  });

  // 8. Hapus Akun Peserta oleh Admin
  app.delete('/api/participants/:id', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    if (id === db.adminUser.id) {
      return res.status(403).json({ success: false, error: 'Akun administrator tidak boleh dihapus.' });
    }

    updateDb(state => {
      state.users = state.users.filter(u => u.id !== id);
      delete state.watchLogs[id];
    });

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

    let updatedLogs: VideoWatchLog[] = [];
    updateDb(state => {
      if (!state.watchLogs[traineeId]) {
        state.watchLogs[traineeId] = [];
      }
      const traineeLogs = state.watchLogs[traineeId];
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
      updatedLogs = state.watchLogs[traineeId];
    });

    res.json({ success: true, logs: updatedLogs });
  });

  // 10. Pembuatan Pesanan Baru
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Keranjang belanja kosong.' });
    }

    let createdOrder: Order | null = null;
    updateDb(state => {
      const orderCount = state.orders.length + 1;
      const padCount = orderCount.toString().padStart(4, '0');

      const newOrder: Order = {
        ...orderData,
        id: orderData.id || `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: `XNVD-ORD-${padCount}`,
        invoiceNumber: `${state.paymentSettings.invoicePrefix}/${padCount}`,
        receiptNumber: `${state.paymentSettings.receiptPrefix}/${padCount}`,
        warehouseSlipNumber: `${state.paymentSettings.warehouseSlipPrefix}/${padCount}`,
        createdAt: new Date().toISOString(),
        adminSignerName: state.appSettings.adminSignerName,
        adminSignatureUrl: state.appSettings.adminSignatureDataUrl
      };

      // Kurangi kuantitas produk di database
      newOrder.items.forEach(it => {
        const prod = state.products.find(p => p.id === it.product.id);
        if (prod) {
          prod.quantity = Math.max(0, prod.quantity - it.quantity);
        }
      });

      state.orders.unshift(newOrder);
      createdOrder = newOrder;
    });

    res.json({ success: true, order: createdOrder });
  });

  // 11. Perbarui Status Pesanan & Nomor Resi
  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, checkpointNote, customTrackingCode } = req.body;

    let updatedOrder: Order | null = null;
    updateDb(state => {
      const ord = state.orders.find(o => o.id === id);
      if (ord) {
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

        updatedOrder = ord;
      }
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
    }

    res.json({ success: true, order: updatedOrder });
  });

  // 12. Tambah / Edit / Hapus Produk
  app.post('/api/products', (req, res) => {
    const data = req.body;
    const original = Number(data.originalPrice) || 0;
    const disc = Number(data.discountPercentage) || 0;
    const finalPrice = Math.max(0, original - (original * (disc / 100)));

    const newProd: ProductItem = {
      ...data,
      id: data.id || `PROD-${Date.now().toString().slice(-5)}`,
      sku: data.sku || `SKU-XNVD-${Math.floor(1000 + Math.random() * 9000)}`,
      finalPrice: Number(finalPrice.toFixed(2))
    };

    updateDb(state => {
      const existingIdx = state.products.findIndex(p => p.id === newProd.id);
      if (existingIdx !== -1) {
        state.products[existingIdx] = newProd;
      } else {
        state.products.unshift(newProd);
      }
    });

    res.json({ success: true, product: newProd });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    let updatedProd: ProductItem | null = null;

    updateDb(state => {
      const idx = state.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const original = Number(data.originalPrice ?? state.products[idx].originalPrice);
        const disc = Number(data.discountPercentage ?? state.products[idx].discountPercentage);
        const finalPrice = Math.max(0, original - (original * (disc / 100)));

        state.products[idx] = {
          ...state.products[idx],
          ...data,
          finalPrice: Number(finalPrice.toFixed(2))
        };
        updatedProd = state.products[idx];
      }
    });

    if (!updatedProd) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    }

    res.json({ success: true, product: updatedProd });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    updateDb(state => {
      state.products = state.products.filter(p => p.id !== id);
    });
    res.json({ success: true });
  });

  // 13. Tambah / Batch Unggah / Hapus Video Pelatihan
  app.post('/api/videos', (req, res) => {
    const data = req.body;
    const totalSecs = Number(data.durationSeconds) || 600;
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);

    const db = getDb();
    const newVideo: VideoItem = {
      ...data,
      id: data.id || `VID-${(db.videos.length + 1).toString().padStart(3, '0')}`,
      durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
      uploadDate: data.uploadDate || new Date().toISOString(),
      viewsCount: data.viewsCount || 0,
      uploadedBy: data.uploadedBy || db.adminUser.name
    };

    updateDb(state => {
      const idx = state.videos.findIndex(v => v.id === newVideo.id);
      if (idx !== -1) {
        state.videos[idx] = newVideo;
      } else {
        state.videos.unshift(newVideo);
      }
    });

    res.json({ success: true, video: newVideo });
  });

  // Batch upload video
  app.post('/api/videos/batch', (req, res) => {
    const { videos: incomingVideos } = req.body;
    if (!Array.isArray(incomingVideos) || incomingVideos.length === 0) {
      return res.status(400).json({ success: false, error: 'Daftar video tidak valid.' });
    }

    let addedCount = 0;
    const addedList: VideoItem[] = [];

    updateDb(state => {
      const now = new Date().toISOString();
      for (const data of incomingVideos) {
        const norm = (data.title || '').trim().toLowerCase();
        if (!norm) continue;

        const totalSecs = Number(data.durationSeconds) || 600;
        const m = Math.floor(totalSecs / 60);
        const s = Math.floor(totalSecs % 60);
        const videoId = data.id || `VID-${(state.videos.length + addedList.length + 1).toString().padStart(3, '0')}`;

        const newVideo: VideoItem = {
          ...data,
          id: videoId,
          durationSeconds: totalSecs,
          durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
          uploadDate: data.uploadDate || now,
          viewsCount: data.viewsCount || 0,
          uploadedBy: data.uploadedBy || state.adminUser.name,
          checksum: data.checksum || `CHK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
        };

        const existingIdx = state.videos.findIndex(v => v.id === newVideo.id || v.title.trim().toLowerCase() === norm);
        if (existingIdx !== -1) {
          state.videos[existingIdx] = newVideo;
        } else {
          addedList.push(newVideo);
        }
      }

      if (addedList.length > 0) {
        state.videos = [...addedList, ...state.videos];
      }
      addedCount = addedList.length;
    });

    res.json({ success: true, count: addedCount, videos: addedList });
  });

  app.delete('/api/videos/:id', (req, res) => {
    const { id } = req.params;
    updateDb(state => {
      state.videos = state.videos.filter(v => v.id !== id);
    });
    res.json({ success: true });
  });

  // Hapus video secara massal (batch delete atau hapus semua video)
  app.post('/api/videos/batch-delete', (req, res) => {
    const { videoIds, deleteAll } = req.body;
    let deletedCount = 0;

    updateDb(state => {
      const beforeCount = state.videos.length;
      if (deleteAll === true) {
        state.videos = [];
        deletedCount = beforeCount;
      } else if (Array.isArray(videoIds) && videoIds.length > 0) {
        const idsSet = new Set(videoIds);
        state.videos = state.videos.filter(v => !idsSet.has(v.id));
        deletedCount = beforeCount - state.videos.length;
      }
    });

    res.json({ success: true, count: deletedCount });
  });

  // 14. Simpan Pengaturan (Aplikasi, Pembayaran, Kurir)
  app.post('/api/settings/app', (req, res) => {
    let savedSettings: AppSettings | null = null;
    updateDb(state => {
      state.appSettings = { ...state.appSettings, ...req.body };
      savedSettings = state.appSettings;
    });
    res.json({ success: true, appSettings: savedSettings });
  });

  app.post('/api/settings/payment', (req, res) => {
    let savedSettings: PaymentSettings | null = null;
    updateDb(state => {
      state.paymentSettings = { ...state.paymentSettings, ...req.body };
      savedSettings = state.paymentSettings;
    });
    res.json({ success: true, paymentSettings: savedSettings });
  });

  app.post('/api/settings/delivery', (req, res) => {
    let savedServices: DeliveryServiceConfig[] = [];
    updateDb(state => {
      if (Array.isArray(req.body)) {
        state.deliveryServices = req.body;
      }
      savedServices = state.deliveryServices;
    });
    res.json({ success: true, deliveryServices: savedServices });
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
