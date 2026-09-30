import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  User,
  VideoItem,
  ProductItem,
  Order,
  AppSettings,
  PaymentSettings,
  DeliveryServiceConfig,
  VideoWatchLog,
  OrderStatus
} from '../types';

export interface CloudStateCallbacks {
  onVideos?: (videos: VideoItem[]) => void;
  onProducts?: (products: ProductItem[]) => void;
  onUsers?: (users: User[]) => void;
  onOrders?: (orders: Order[]) => void;
  onSettings?: (data: {
    appSettings?: AppSettings;
    paymentSettings?: PaymentSettings;
    deliveryServices?: DeliveryServiceConfig[];
  }) => void;
  onWatchLogs?: (watchLogs: Record<string, VideoWatchLog[]>) => void;
}

// 1. Dengarkan pembaruan real-time dari Firestore ke semua perangkat (HP, Laptop, Tablet)
export function subscribeToCloudDatabase(callbacks: CloudStateCallbacks): () => void {
  const unsubscribes: Array<() => void> = [];

  // A. Koleksi Video Real-Time
  try {
    const vidsRef = collection(db, 'videos');
    const unsubVideos = onSnapshot(vidsRef, (snapshot) => {
      if (!snapshot.empty) {
        const vids: VideoItem[] = [];
        snapshot.forEach((d) => {
          vids.push(d.data() as VideoItem);
        });
        // Urutkan berdasarkan uploadDate menurun
        vids.sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime());
        callbacks.onVideos?.(vids);
      }
    }, (err) => console.warn('Firestore videos sub error:', err));
    unsubscribes.push(unsubVideos);
  } catch (e) {
    console.warn('Init videos listener error:', e);
  }

  // B. Koleksi Produk Real-Time
  try {
    const prodsRef = collection(db, 'products');
    const unsubProds = onSnapshot(prodsRef, (snapshot) => {
      if (!snapshot.empty) {
        const prods: ProductItem[] = [];
        snapshot.forEach((d) => {
          prods.push(d.data() as ProductItem);
        });
        callbacks.onProducts?.(prods);
      }
    }, (err) => console.warn('Firestore products sub error:', err));
    unsubscribes.push(unsubProds);
  } catch (e) {
    console.warn('Init products listener error:', e);
  }

  // C. Koleksi Pengguna / Akun Real-Time
  try {
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      if (!snapshot.empty) {
        const users: User[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as User);
        });
        callbacks.onUsers?.(users);
      }
    }, (err) => console.warn('Firestore users sub error:', err));
    unsubscribes.push(unsubUsers);
  } catch (e) {
    console.warn('Init users listener error:', e);
  }

  // D. Koleksi Pesanan Real-Time
  try {
    const ordersRef = collection(db, 'orders');
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      if (!snapshot.empty) {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push(d.data() as Order);
        });
        orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callbacks.onOrders?.(orders);
      }
    }, (err) => console.warn('Firestore orders sub error:', err));
    unsubscribes.push(unsubOrders);
  } catch (e) {
    console.warn('Init orders listener error:', e);
  }

  // E. Pengaturan Sistem Sentral Real-Time
  try {
    const sysDocRef = doc(db, 'system', 'main_config');
    const unsubSys = onSnapshot(sysDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callbacks.onSettings?.({
          appSettings: data.appSettings,
          paymentSettings: data.paymentSettings,
          deliveryServices: data.deliveryServices
        });
      }
    }, (err) => console.warn('Firestore settings sub error:', err));
    unsubscribes.push(unsubSys);
  } catch (e) {
    console.warn('Init system listener error:', e);
  }

  // F. Pemantauan Durasi Tonton Real-Time
  try {
    const logsRef = collection(db, 'watchLogs');
    const unsubLogs = onSnapshot(logsRef, (snapshot) => {
      if (!snapshot.empty) {
        const logsMap: Record<string, VideoWatchLog[]> = {};
        snapshot.forEach((d) => {
          logsMap[d.id] = (d.data().logs as VideoWatchLog[]) || [];
        });
        callbacks.onWatchLogs?.(logsMap);
      }
    }, (err) => console.warn('Firestore watchLogs sub error:', err));
    unsubscribes.push(unsubLogs);
  } catch (e) {
    console.warn('Init watchLogs listener error:', e);
  }

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}

// 2. Simpan Video Tunggal ke Cloud Firestore
export async function saveVideoToCloud(video: VideoItem): Promise<void> {
  try {
    await setDoc(doc(db, 'videos', video.id), video);
  } catch (err) {
    console.warn('Gagal simpan video ke Cloud Firestore:', err);
  }
}

// 3. Simpan Video Batch ke Cloud Firestore (Menggunakan Firestore Batch Commit)
export async function saveVideosBatchToCloud(videos: VideoItem[]): Promise<number> {
  if (!videos || videos.length === 0) return 0;
  try {
    // Firestore batch maksimal 500 item per commit
    const chunkSize = 400;
    let savedCount = 0;
    for (let i = 0; i < videos.length; i += chunkSize) {
      const chunk = videos.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((v) => {
        batch.set(doc(db, 'videos', v.id), v);
      });
      await batch.commit();
      savedCount += chunk.length;
    }
    return savedCount;
  } catch (err) {
    console.warn('Gagal simpan batch video ke Cloud Firestore:', err);
    return 0;
  }
}

// 4. Hapus Video dari Cloud Firestore
export async function deleteVideoFromCloud(videoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (err) {
    console.warn('Gagal hapus video dari Cloud Firestore:', err);
  }
}

// 5. Hapus Batch Video dari Cloud Firestore
export async function deleteVideosBatchFromCloud(videoIds: string[], deleteAll = false): Promise<void> {
  try {
    if (deleteAll) {
      const snap = await getDocs(collection(db, 'videos'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return;
    }
    const batch = writeBatch(db);
    videoIds.forEach((id) => {
      batch.delete(doc(db, 'videos', id));
    });
    await batch.commit();
  } catch (err) {
    console.warn('Gagal batch delete video dari Cloud Firestore:', err);
  }
}

// 6. Simpan Produk ke Cloud Firestore
export async function saveProductToCloud(product: ProductItem): Promise<void> {
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (err) {
    console.warn('Gagal simpan produk ke Cloud Firestore:', err);
  }
}

// 7. Simpan Batch Produk ke Cloud Firestore
export async function saveProductsBatchToCloud(products: ProductItem[]): Promise<void> {
  if (!products || products.length === 0) return;
  try {
    const batch = writeBatch(db);
    products.forEach((p) => {
      batch.set(doc(db, 'products', p.id), p);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Gagal simpan batch produk ke Cloud Firestore:', err);
  }
}

// 8. Hapus Produk dari Cloud Firestore
export async function deleteProductFromCloud(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.warn('Gagal hapus produk dari Cloud Firestore:', err);
  }
}

// 9. Simpan Pengaturan ke Cloud Firestore
export async function saveSettingsToCloud(data: {
  appSettings?: AppSettings;
  paymentSettings?: PaymentSettings;
  deliveryServices?: DeliveryServiceConfig[];
}): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'main_config'), data, { merge: true });
  } catch (err) {
    console.warn('Gagal simpan pengaturan ke Cloud Firestore:', err);
  }
}

// 10. Simpan Akun Pengguna / Admin ke Cloud Firestore
export async function saveUserToCloud(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    console.warn('Gagal simpan user ke Cloud Firestore:', err);
  }
}

// 11. Hapus Akun Peserta dari Cloud Firestore
export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    await deleteDoc(doc(db, 'watchLogs', userId));
  } catch (err) {
    console.warn('Gagal hapus user dari Cloud Firestore:', err);
  }
}

// 12. Simpan Pesanan ke Cloud Firestore
export async function saveOrderToCloud(order: Order): Promise<void> {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    console.warn('Gagal simpan order ke Cloud Firestore:', err);
  }
}

// 13. Catat Pemantauan Durasi Tonton ke Cloud Firestore
export async function recordWatchLogToCloud(traineeId: string, logs: VideoWatchLog[]): Promise<void> {
  try {
    await setDoc(doc(db, 'watchLogs', traineeId), { logs }, { merge: true });
  } catch (err) {
    console.warn('Gagal simpan watchLog ke Cloud Firestore:', err);
  }
}

// 14. Sinkronisasi Data Master Lengkap ke Cloud Firestore
export async function syncFullStateToCloud(state: {
  videos?: VideoItem[];
  products?: ProductItem[];
  users?: User[];
  orders?: Order[];
  appSettings?: AppSettings;
  paymentSettings?: PaymentSettings;
  deliveryServices?: DeliveryServiceConfig[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Simpan Settings
    if (state.appSettings || state.paymentSettings || state.deliveryServices) {
      await saveSettingsToCloud({
        appSettings: state.appSettings,
        paymentSettings: state.paymentSettings,
        deliveryServices: state.deliveryServices
      });
    }

    // 2. Simpan Videos
    if (state.videos && state.videos.length > 0) {
      await saveVideosBatchToCloud(state.videos);
    }

    // 3. Simpan Products
    if (state.products && state.products.length > 0) {
      await saveProductsBatchToCloud(state.products);
    }

    // 4. Simpan Users
    if (state.users && state.users.length > 0) {
      const batch = writeBatch(db);
      state.users.forEach((u) => {
        batch.set(doc(db, 'users', u.id), u);
      });
      await batch.commit();
    }

    // 5. Simpan Orders
    if (state.orders && state.orders.length > 0) {
      const batch = writeBatch(db);
      state.orders.forEach((o) => {
        batch.set(doc(db, 'orders', o.id), o);
      });
      await batch.commit();
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saat syncFullStateToCloud:', err);
    return { success: false, error: err?.message || 'Gagal menyinkronkan ke database cloud.' };
  }
}
