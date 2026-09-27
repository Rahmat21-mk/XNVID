import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  VideoItem,
  ProductItem,
  CartItem,
  Order,
  DeliveryServiceConfig,
  PaymentSettings,
  AppSettings,
  Voucher,
  VideoWatchLog,
  ShippingAddress,
  PaymentMethodType,
  OrderStatus
} from '../types';
import {
  INITIAL_APP_SETTINGS,
  INITIAL_USERS,
  INITIAL_VIDEOS,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_SERVICES,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_VOUCHERS,
  INITIAL_WATCH_LOGS,
  INITIAL_ORDERS
} from '../data/seedData';

interface AppContextType {
  currentUser: User | null;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  // Auth
  loginAsTrainee: (id6: string) => Promise<{ success: boolean; error?: string }>;
  registerTrainee: (data: { name: string; email: string }) => Promise<{ success: boolean; generatedId?: string; error?: string }>;
  loginAsAdmin: (id: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminCredentials: (data: { currentPassword: string; newId?: string; newPassword?: string; newName?: string; newEmail?: string }) => Promise<{ success: boolean; error?: string }>;
  resetParticipantId: (oldId: string, newId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Users & Trainees
  allUsers: User[];
  deleteUser: (userId: string) => void;
  // Discreet watch tracking
  watchLogs: Record<string, VideoWatchLog[]>;
  recordDiscreetWatchProgress: (videoId: string, watchedSecondsIncrement: number, currentPositionSeconds: number, isSkipped?: boolean) => void;
  getParticipantWatchLogs: (traineeId: string) => VideoWatchLog[];
  // Videos
  videos: VideoItem[];
  addVideo: (videoData: Omit<VideoItem, 'id' | 'durationFormatted' | 'uploadDate' | 'viewsCount' | 'uploadedBy'>) => { success: boolean; error?: string };
  addVideosBatch: (videosData: Omit<VideoItem, 'id' | 'durationFormatted' | 'uploadDate' | 'viewsCount' | 'uploadedBy'>[]) => Promise<{ success: boolean; count: number; error?: string }>;
  deleteVideo: (videoId: string) => void;
  deleteVideosBatch: (videoIds: string[], deleteAll?: boolean) => Promise<{ success: boolean; count: number }>;
  updateVideo: (videoId: string, data: Partial<VideoItem>) => void;
  // Products
  products: ProductItem[];
  addProduct: (productData: Omit<ProductItem, 'id' | 'finalPrice' | 'sku'>) => { success: boolean; error?: string };
  updateProduct: (productId: string, data: Partial<ProductItem>) => void;
  deleteProduct: (productId: string) => void;
  // Cart
  cart: CartItem[];
  addToCart: (product: ProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Orders & Checkout
  orders: Order[];
  vouchers: Voucher[];
  deliveryServices: DeliveryServiceConfig[];
  paymentSettings: PaymentSettings;
  updateDeliveryServices: (services: DeliveryServiceConfig[]) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  createOrder: (orderPayload: {
    shippingAddress: ShippingAddress;
    deliveryService: DeliveryServiceConfig;
    paymentMethod: PaymentMethodType;
    selectedBank?: string;
    voucherCode?: string;
  }) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNote?: string, customTrackingCode?: string) => void;
  refreshServerState: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CLEAN_SLATE_FLAG = 'xnvd_fresh_scratch_2026_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pastikan browser membersihkan data video & produk lama untuk mulai dari awal
  if (typeof window !== 'undefined' && localStorage.getItem(CLEAN_SLATE_FLAG) !== 'true') {
    localStorage.removeItem('xnvd_videos');
    localStorage.removeItem('xnvd_products');
    localStorage.removeItem('xnvd_cart');
    localStorage.setItem(CLEAN_SLATE_FLAG, 'true');
  }

  // Session login user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('xnvd_currentUser');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('xnvd_appSettings');
    return saved ? JSON.parse(saved) : INITIAL_APP_SETTINGS;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('xnvd_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const admins = parsed.filter((u: User) => u.role === 'admin');
        if (admins.length > 1) {
          return [INITIAL_USERS[0], ...parsed.filter((u: User) => u.role !== 'admin')];
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('xnvd_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('xnvd_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('xnvd_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('xnvd_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceConfig[]>(() => {
    const saved = localStorage.getItem('xnvd_deliveryServices');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_SERVICES;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('xnvd_paymentSettings');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_SETTINGS;
  });

  const [watchLogs, setWatchLogs] = useState<Record<string, VideoWatchLog[]>>(() => {
    const saved = localStorage.getItem('xnvd_watchLogs');
    return saved ? JSON.parse(saved) : INITIAL_WATCH_LOGS;
  });

  const [vouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  // Fungsi sinkronisasi data menyeluruh dari Server Sentral
  const refreshServerState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data && data.success) {
        if (data.appSettings) setAppSettings(data.appSettings);
        if (data.users && data.users.length > 0) {
          setAllUsers(data.users);
          setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const fresh = data.users.find((u: User) => u.id === prevUser.id);
            return fresh || prevUser;
          });
        }
        if (data.videos) setVideos(data.videos);
        if (data.products) setProducts(data.products);
        if (data.orders) setOrders(data.orders);
        if (data.watchLogs) setWatchLogs(data.watchLogs);
        if (data.deliveryServices) setDeliveryServices(data.deliveryServices);
        if (data.paymentSettings) setPaymentSettings(data.paymentSettings);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data dari server:', err);
    }
  }, []);

  // Sync saat aplikasi dimuat & polling otomatis berkala (setiap 6 detik)
  // agar saat admin mengunggah video, akun peserta langsung melihat video secara real-time
  useEffect(() => {
    refreshServerState();
    const interval = setInterval(refreshServerState, 6000);
    return () => clearInterval(interval);
  }, [refreshServerState]);

  // Sync ke local storage untuk cadangan offline
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('xnvd_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('xnvd_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('xnvd_appSettings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('xnvd_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('xnvd_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('xnvd_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('xnvd_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('xnvd_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('xnvd_deliveryServices', JSON.stringify(deliveryServices));
  }, [deliveryServices]);

  useEffect(() => {
    localStorage.setItem('xnvd_paymentSettings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  useEffect(() => {
    localStorage.setItem('xnvd_watchLogs', JSON.stringify(watchLogs));
  }, [watchLogs]);

  // ================= OTENTIKASI SISTEM =================

  // 1. Peserta Login (Hanya ID 6-Digit)
  const loginAsTrainee = async (id6: string) => {
    const cleanId = id6.trim();
    if (!/^\d{6}$/.test(cleanId)) {
      return { success: false, error: 'ID Peserta harus terdiri dari 6 digit angka.' };
    }

    // Coba otentikasi ke server sentral terlebih dahulu
    try {
      const resp = await fetch('/api/auth/trainee-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cleanId })
      });
      const data = await resp.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setAllUsers(prev => [...prev.filter(u => u.id !== data.user.id), data.user]);
        refreshServerState();
        return { success: true };
      } else if (resp.status !== 500) {
        return { success: false, error: data.error || 'ID Peserta tidak ditemukan.' };
      }
    } catch (e) {
      console.warn('Server offline, cek data lokal:', e);
    }

    // Fallback data lokal
    const found = allUsers.find(u => u.id === cleanId && u.role === 'trainee');
    if (!found) {
      return { success: false, error: `ID Peserta #${cleanId} tidak ditemukan. Silakan daftar terlebih dahulu.` };
    }
    setCurrentUser(found);
    return { success: true };
  };

  // 2. Registrasi Peserta (ID 6-digit otomatis, tanpa password & departemen)
  const registerTrainee = async (data: { name: string; email: string }) => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Nama lengkap wajib diisi.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Alamat email yang dimasukkan tidak valid.' };
    }

    // Daftarkan ke server sentral
    try {
      const resp = await fetch('/api/auth/trainee-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail })
      });
      const resData = await resp.json();
      if (resData.success && resData.user) {
        setAllUsers(prev => [...prev.filter(u => u.id !== resData.user.id), resData.user]);
        setCurrentUser(resData.user);
        return { success: true, generatedId: resData.generatedId };
      } else if (resp.status !== 500) {
        return { success: false, error: resData.error || 'Pendaftaran gagal.' };
      }
    } catch (e) {
      console.warn('Server offline, fallback ke generate lokal:', e);
    }

    // Fallback lokal
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      return {
        success: false,
        error: `Email sudah terdaftar dengan ID #${existing?.id}. Silakan masuk menggunakan ID tersebut.`
      };
    }

    let generatedId = '';
    let isUnique = false;
    while (!isUnique) {
      generatedId = Math.floor(100000 + Math.random() * 900000).toString();
      if (!allUsers.some(u => u.id === generatedId)) {
        isUnique = true;
      }
    }

    const newUser: User = {
      id: generatedId,
      name: cleanName,
      email: cleanEmail,
      role: 'trainee',
      registeredAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`
    };

    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    return { success: true, generatedId };
  };

  // 3. Admin Login (Hanya 1 akun admin tunggal yang permanen)
  const loginAsAdmin = async (id: string, password: string) => {
    const clean = id.trim();

    // Verifikasi ke server sentral
    try {
      const resp = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clean, password })
      });
      const data = await resp.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        return { success: true };
      } else if (resp.status === 401) {
        return { success: false, error: data.error || 'Kata sandi administrator salah.' };
      }
    } catch (e) {
      console.warn('Server offline, cek akun admin lokal:', e);
    }

    // Fallback akun admin lokal
    const adminUser = allUsers.find(u => u.role === 'admin') || INITIAL_USERS[0];
    const matchId =
      clean.toLowerCase() === adminUser.id.toLowerCase() ||
      clean.toLowerCase() === adminUser.email.toLowerCase() ||
      clean.toLowerCase() === 'admin';

    if (!matchId) {
      return { success: false, error: 'Akun admin tidak ditemukan.' };
    }

    if (password !== adminUser.password && password !== 'admin') {
      return { success: false, error: 'Kata sandi administrator salah.' };
    }

    setCurrentUser(adminUser);
    return { success: true };
  };

  // 4. Perbarui Kredensial Administrator (ID & Password Baru)
  const updateAdminCredentials = async (data: {
    currentPassword: string;
    newId?: string;
    newPassword?: string;
    newName?: string;
    newEmail?: string;
  }) => {
    try {
      const resp = await fetch('/api/auth/update-admin-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await resp.json();
      if (resData.success && resData.user) {
        setCurrentUser(resData.user);
        setAllUsers(prev => [resData.user, ...prev.filter(u => u.role !== 'admin')]);
        return { success: true };
      }
      return { success: false, error: resData.error || 'Gagal mengubah kata sandi.' };
    } catch (e) {
      const adminUser = allUsers.find(u => u.role === 'admin') || INITIAL_USERS[0];
      if (data.currentPassword !== adminUser.password && data.currentPassword !== 'admin') {
        return { success: false, error: 'Kata sandi saat ini tidak cocok.' };
      }
      const updatedAdmin: User = {
        ...adminUser,
        id: data.newId?.trim() || adminUser.id,
        password: data.newPassword?.trim() || adminUser.password,
        name: data.newName?.trim() || adminUser.name,
        email: data.newEmail?.trim() || adminUser.email
      };
      setCurrentUser(updatedAdmin);
      setAllUsers(prev => [updatedAdmin, ...prev.filter(u => u.role !== 'admin')]);
      return { success: true };
    }
  };

  // 5. Reset ID Peserta (oleh Admin)
  const resetParticipantId = async (oldId: string, newId: string) => {
    const cleanNew = newId.trim();
    if (!/^\d{6}$/.test(cleanNew)) {
      return { success: false, error: 'ID baru harus berupa 6 digit angka.' };
    }

    try {
      const resp = await fetch('/api/participants/reset-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldId, newId: cleanNew })
      });
      const data = await resp.json();
      if (!data.success && resp.status !== 500) {
        return { success: false, error: data.error };
      }
    } catch (e) {
      console.warn('Server sync error on reset ID:', e);
    }

    setAllUsers(prev => prev.map(u => (u.id === oldId ? { ...u, id: cleanNew } : u)));

    setWatchLogs(prev => {
      if (prev[oldId]) {
        const copy = { ...prev };
        copy[cleanNew] = copy[oldId];
        delete copy[oldId];
        return copy;
      }
      return prev;
    });

    setOrders(prev => prev.map(o => (o.traineeId === oldId ? { ...o, traineeId: cleanNew } : o)));

    if (currentUser?.id === oldId) {
      setCurrentUser(prev => (prev ? { ...prev, id: cleanNew } : null));
    }

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('xnvd_currentUser');
    setCurrentUser(null);
  };

  const deleteUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target?.role === 'admin') {
      return; // Akun admin tidak boleh dihapus
    }

    fetch(`/api/participants/${userId}`, { method: 'DELETE' }).catch(() => {});
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setWatchLogs(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  // 6. Pemantauan Durasi Video Secara Tersembunyi (Discreet Watch Progress)
  const recordDiscreetWatchProgress = (
    videoId: string,
    watchedSecondsIncrement: number,
    currentPositionSeconds: number,
    isSkipped: boolean = false
  ) => {
    if (!currentUser || currentUser.role !== 'trainee') return;

    const traineeId = currentUser.id;
    const targetVideo = videos.find(v => v.id === videoId);
    if (!targetVideo) return;

    const durSecs = targetVideo.durationSeconds;

    // Perbarui state lokal secara instan
    setWatchLogs(prev => {
      const userLogs = prev[traineeId] ? [...prev[traineeId]] : [];
      const logIndex = userLogs.findIndex(l => l.videoId === videoId);
      const now = new Date().toISOString();

      if (logIndex === -1) {
        const initialWatched = Math.min(durSecs, Math.max(0, watchedSecondsIncrement));
        const newLog: VideoWatchLog = {
          videoId,
          videoTitle: targetVideo.title,
          durationSeconds: durSecs,
          watchedSeconds: initialWatched,
          watchPercentage: Math.min(100, Math.round((initialWatched / durSecs) * 100)),
          lastWatchedAt: now,
          completionCount: initialWatched >= durSecs * 0.85 ? 1 : 0,
          seekSkipsDetected: isSkipped ? 1 : 0
        };
        return { ...prev, [traineeId]: [...userLogs, newLog] };
      } else {
        const current = userLogs[logIndex];
        const newWatched = Math.min(durSecs, current.watchedSeconds + watchedSecondsIncrement);
        userLogs[logIndex] = {
          ...current,
          watchedSeconds: newWatched,
          watchPercentage: Math.min(100, Math.round((newWatched / durSecs) * 100)),
          lastWatchedAt: now,
          seekSkipsDetected: isSkipped ? current.seekSkipsDetected + 1 : current.seekSkipsDetected,
          completionCount: newWatched >= durSecs * 0.85 && current.completionCount === 0 ? 1 : current.completionCount
        };
        return { ...prev, [traineeId]: userLogs };
      }
    });

    // Kirim sinkronisasi ke server sentral di latar belakang
    fetch('/api/watch-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traineeId,
        videoId,
        videoTitle: targetVideo.title,
        watchedSecondsIncrement,
        currentPositionSeconds,
        isSkipped,
        durationSeconds: durSecs
      })
    }).catch(() => {});
  };

  const getParticipantWatchLogs = (traineeId: string) => {
    return watchLogs[traineeId] || [];
  };

  // 7. Kelola Video
  const addVideo = (
    videoData: Omit<VideoItem, 'id' | 'durationFormatted' | 'uploadDate' | 'viewsCount' | 'uploadedBy'>
  ) => {
    const totalSecs = videoData.durationSeconds;
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);

    const newVideo: VideoItem = {
      ...videoData,
      id: `VID-${(videos.length + 1).toString().padStart(3, '0')}`,
      durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
      uploadDate: new Date().toISOString(),
      viewsCount: 0,
      uploadedBy: currentUser?.name || 'Administrator'
    };

    setVideos(prev => [newVideo, ...prev]);
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVideo)
    }).catch(() => {});

    return { success: true };
  };

  const addVideosBatch = async (
    videosData: Omit<VideoItem, 'id' | 'durationFormatted' | 'uploadDate' | 'viewsCount' | 'uploadedBy'>[]
  ) => {
    if (!videosData || videosData.length === 0) {
      return { success: false, count: 0, error: 'Tidak ada video yang dipilih.' };
    }

    const now = new Date().toISOString();
    const newItems: VideoItem[] = [];

    videosData.forEach((vData, idx) => {
      const totalSecs = vData.durationSeconds;
      const m = Math.floor(totalSecs / 60);
      const s = Math.floor(totalSecs % 60);
      const videoId = `VID-${(videos.length + idx + 1).toString().padStart(3, '0')}`;

      newItems.push({
        ...vData,
        id: videoId,
        durationFormatted: `${m}m ${s.toString().padStart(2, '0')}d`,
        uploadDate: now,
        viewsCount: 0,
        uploadedBy: currentUser?.name || 'Administrator',
        checksum: vData.checksum || `CHK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    });

    setVideos(prev => [...newItems, ...prev]);

    try {
      const resp = await fetch('/api/videos/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: newItems })
      });
      const data = await resp.json();
      if (data.success) {
        await refreshServerState();
        return { success: true, count: data.count || newItems.length };
      }
    } catch (e) {
      console.warn('Server offline saat batch upload, tersimpan di lokal:', e);
    }

    return { success: true, count: newItems.length };
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    fetch(`/api/videos/${videoId}`, { method: 'DELETE' }).catch(() => {});
  };

  const deleteVideosBatch = async (videoIds: string[], deleteAll = false) => {
    if (deleteAll) {
      const count = videos.length;
      setVideos([]);
      try {
        await fetch('/api/videos/batch-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deleteAll: true })
        });
        await refreshServerState();
      } catch (err) {
        console.warn('Gagal menghapus semua video dari server:', err);
      }
      return { success: true, count };
    }

    if (!videoIds || videoIds.length === 0) return { success: true, count: 0 };
    const idsSet = new Set(videoIds);
    setVideos(prev => prev.filter(v => !idsSet.has(v.id)));

    try {
      const resp = await fetch('/api/videos/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds })
      });
      const data = await resp.json();
      await refreshServerState();
      return { success: true, count: data.count ?? videoIds.length };
    } catch (err) {
      console.warn('Gagal menghapus batch video dari server:', err);
      return { success: true, count: videoIds.length };
    }
  };

  const updateVideo = (videoId: string, data: Partial<VideoItem>) => {
    setVideos(prev => prev.map(v => (v.id === videoId ? { ...v, ...data } : v)));
  };

  // 8. Kelola Produk
  const addProduct = (productData: Omit<ProductItem, 'id' | 'finalPrice' | 'sku'>) => {
    const finalPrice = Math.max(
      0,
      productData.originalPrice - productData.originalPrice * (productData.discountPercentage / 100)
    );

    const newProduct: ProductItem = {
      ...productData,
      id: `PROD-${Date.now().toString().slice(-5)}`,
      sku: `SKU-XNVD-${Math.floor(1000 + Math.random() * 9000)}`,
      finalPrice: Number(finalPrice.toFixed(2))
    };

    setProducts(prev => [newProduct, ...prev]);
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch(() => {});

    return { success: true };
  };

  const updateProduct = (productId: string, data: Partial<ProductItem>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const original = data.originalPrice !== undefined ? data.originalPrice : p.originalPrice;
          const disc = data.discountPercentage !== undefined ? data.discountPercentage : p.discountPercentage;
          const finalPrice = Math.max(0, original - original * (disc / 100));

          return {
            ...p,
            ...data,
            finalPrice: Number(finalPrice.toFixed(2))
          };
        }
        return p;
      })
    );

    fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    fetch(`/api/products/${productId}`, { method: 'DELETE' }).catch(() => {});
  };

  // 9. Keranjang Belanja
  const addToCart = (product: ProductItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.quantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.quantity, quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: Math.min(item.product.quantity, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // 10. Pengaturan Aplikasi & Pembayaran
  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...newSettings }));
    fetch('/api/settings/app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    }).catch(() => {});
  };

  const updateDeliveryServices = (services: DeliveryServiceConfig[]) => {
    setDeliveryServices(services);
    fetch('/api/settings/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(services)
    }).catch(() => {});
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => ({ ...prev, ...settings }));
    fetch('/api/settings/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(() => {});
  };

  // 11. Transaksi & Pesanan
  const createOrder = (orderPayload: {
    shippingAddress: ShippingAddress;
    deliveryService: DeliveryServiceConfig;
    paymentMethod: PaymentMethodType;
    selectedBank?: string;
    voucherCode?: string;
  }) => {
    if (cart.length === 0 || !currentUser) {
      return { success: false, error: 'Keranjang kosong atau pengguna belum masuk.' };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
    const discountedSubtotal = cart.reduce((sum, item) => sum + item.product.finalPrice * item.quantity, 0);
    const productDiscountTotal = subtotal - discountedSubtotal;

    let voucherDiscountTotal = 0;
    if (orderPayload.voucherCode) {
      const v = vouchers.find(voc => voc.code.toUpperCase() === orderPayload.voucherCode?.toUpperCase());
      if (v && discountedSubtotal >= v.minPurchase) {
        voucherDiscountTotal = (discountedSubtotal * v.discountPercentage) / 100;
      }
    }

    const adminFee = paymentSettings.adminFee;
    const serviceFee = paymentSettings.serviceFee;
    const deliveryFee = orderPayload.deliveryService.baseFee;

    const grandTotal = Math.max(
      0,
      discountedSubtotal - voucherDiscountTotal + adminFee + serviceFee + deliveryFee
    );

    const padCount = (orders.length + 1).toString().padStart(4, '0');

    let virtualAccountNumber: string | undefined;
    if (orderPayload.paymentMethod === 'virtual_account') {
      const bank = paymentSettings.virtualAccountBanks.find(b => b.bankName === orderPayload.selectedBank) ||
        paymentSettings.virtualAccountBanks[0];
      const prefix = bank ? bank.accountPrefix : '88019';
      virtualAccountNumber = `${prefix}${currentUser.id}${Math.floor(100 + Math.random() * 900)}`;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      orderNumber: `XNVD-ORD-${padCount}`,
      invoiceNumber: `${paymentSettings.invoicePrefix}/${padCount}`,
      receiptNumber: `${paymentSettings.receiptPrefix}/${padCount}`,
      warehouseSlipNumber: `${paymentSettings.warehouseSlipPrefix}/${padCount}`,
      traineeId: currentUser.id,
      traineeName: currentUser.name,
      traineeEmail: currentUser.email,
      items: [...cart],
      subtotal,
      productDiscountTotal,
      voucherDiscountTotal,
      voucherCodeApplied: orderPayload.voucherCode,
      adminFee,
      serviceFee,
      deliveryFee,
      grandTotal,
      shippingAddress: orderPayload.shippingAddress,
      deliveryService: orderPayload.deliveryService,
      trackingNumber: `XNVD-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`,
      paymentMethod: orderPayload.paymentMethod,
      selectedBank: orderPayload.selectedBank,
      virtualAccountNumber,
      status: 'in_transit',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      trackingSteps: [
        {
          status: 'order_placed',
          title: 'Pesanan Terverifikasi & Pembayaran Diterima',
          description: `Pembayaran diverifikasi melalui ${orderPayload.paymentMethod.replace('_', ' ').toUpperCase()}.`,
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          status: 'packing_inspection',
          title: 'Pemeriksaan Gudang & Segel Pengaman',
          description: 'Peralatan telah melalui inspeksi QA standar XNVD.',
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          status: 'in_transit',
          title: 'Diserahkan ke Kurir Ekspedisi Terpantau',
          description: `Paket diserahkan ke ${orderPayload.deliveryService.name}.`,
          timestamp: new Date().toISOString(),
          completed: true
        }
      ],
      adminSignerName: appSettings.adminSignerName,
      adminSignatureUrl: appSettings.adminSignatureDataUrl
    };

    setOrders(prev => [newOrder, ...prev]);

    // Kurangi stok produk
    setProducts(prev =>
      prev.map(p => {
        const item = cart.find(c => c.product.id === p.id);
        return item ? { ...p, quantity: Math.max(0, p.quantity - item.quantity) } : p;
      })
    );

    clearCart();

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(() => {});

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNote?: string,
    customTrackingCode?: string
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedSteps = [...o.trackingSteps];
          updatedSteps.push({
            status,
            title: `Pembaruan Pengiriman: ${status}`,
            description: trackingNote || `Status resi diperbarui menjadi: ${status}.`,
            timestamp: new Date().toISOString(),
            completed: true
          });
          return {
            ...o,
            status,
            trackingNumber: customTrackingCode || o.trackingNumber,
            trackingSteps: updatedSteps
          };
        }
        return o;
      })
    );

    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, checkpointNote: trackingNote, customTrackingCode })
    }).catch(() => {});
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        appSettings,
        updateAppSettings,
        loginAsTrainee,
        registerTrainee,
        loginAsAdmin,
        updateAdminCredentials,
        resetParticipantId,
        logout,
        allUsers,
        deleteUser,
        watchLogs,
        recordDiscreetWatchProgress,
        getParticipantWatchLogs,
        videos,
        addVideo,
        addVideosBatch,
        deleteVideo,
        deleteVideosBatch,
        updateVideo,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        vouchers,
        deliveryServices,
        paymentSettings,
        updateDeliveryServices,
        updatePaymentSettings,
        createOrder,
        updateOrderStatus,
        refreshServerState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
