import { db, storage } from '../config/firebase'; // Import Firestore and Storage instances
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import type {
  User,
  Project,
  Collaboration,
  Rating,
  Message,
  Notification,
  Contract,
  KYCDocument,
  Transaction
} from '../types';

// ============================================================================
// GENERIC UTILS
// ============================================================================

// Helper to convert Firestore snapshot to typed array
const getDocsData = async <T>(q: any): Promise<T[]> => {
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
};

// ============================================================================
// AUTH API (Handled in AuthContext mostly, but keeping for consistency if needed)
// ============================================================================

export const authApi = {
  // Signup logic is now handled in AuthContext directly using Firebase Auth + Firestore
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  getUser: async (userId: string) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    throw new Error('User not found');
  },

  subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  },

  markNotificationAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as User;
  },

  getTalents: async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'talent'));
    return getDocsData<User>(q);
  },

  getCompanies: async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'company'));
    return getDocsData<User>(q);
  },

  getUserProjects: async (userId: string) => {
    // Assuming projects have an 'authorId' or similar field
    // You might need to adjust the field name based on your schema plan
    const q = query(collection(db, 'projects'), where('authorId', '==', userId));
    return getDocsData<Project>(q);
  },

  getUserRatings: async (userId: string) => {
    const q = query(collection(db, 'ratings'), where('toUserId', '==', userId));
    return getDocsData<Rating>(q);
  },

  getUserChats: async (userId: string) => {
    // Logic for chats might be more complex (participants array array-contains)
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
    return getDocsData<any>(q);
  },

  getUserEvents: async (userId: string) => {
    const q = query(collection(db, 'events'), where('userId', '==', userId));
    return getDocsData<any>(q);
  },
};

// ============================================================================
// KYC API
// ============================================================================

export const kycApi = {
  // TODO: Integrate Firebase Storage for file uploads
  uploadDocument: async (
    file: File,
    documentType: string,
    ico?: string,
    companyName?: string
  ) => {
    // Placeholder: You need to implement Firebase Storage upload here
    // const storageRef = ref(storage, 'kyc/' + file.name);
    // await uploadBytes(storageRef, file);
    // const url = await getDownloadURL(storageRef);

    // For now returning mock to satisfy TS
    return {
      id: 'mock-id',
      userId: 'temp-user',
      documentType,
      status: 'pending',
      fileUrl: 'https://via.placeholder.com/150',
      uploadedAt: new Date().toISOString()
    } as KYCDocument;
  },

  getDocuments: async (userId: string) => {
    const q = query(collection(db, 'kyc_documents'), where('userId', '==', userId));
    return getDocsData<KYCDocument>(q);
  },

  reviewDocument: async (
    userId: string,
    documentId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
  ) => {
    const docRef = doc(db, 'kyc_documents', documentId);
    await updateDoc(docRef, { status, rejectionReason });

    // Also update user status if verified
    if (status === 'verified') {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { verified: true, verificationStatus: 'verified' });
    }

    const updated = await getDoc(docRef);
    return { success: true, kycDoc: { id: updated.id, ...updated.data() } as KYCDocument };
  },
};

// ============================================================================
// PROJECT API
// ============================================================================

export const projectApi = {
  createProject: async (data: Partial<Project>) => {
    const docRef = await addDoc(collection(db, 'projects'), data);
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Project;
  },

  getProjects: async () => {
    return getDocsData<Project>(collection(db, 'projects'));
  },

  getProject: async (projectId: string) => {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project;
    }
    throw new Error('Project not found');
  },

  updateProject: async (projectId: string, data: Partial<Project>) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, data);
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Project;
  },

  deleteProject: async (projectId: string) => {
    await deleteDoc(doc(db, 'projects', projectId));
    return { success: true };
  },
};

// ============================================================================
// COLLABORATION API
// ============================================================================

export const collaborationApi = {
  createCollaboration: async (projectId: string, message?: string) => {
    // You'll need to fetch current user ID from AuthContext or pass it in
    // For now this function signature matches the old one, but might need modification
    const collabData = {
      projectId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'collaborations'), collabData);
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Collaboration;
  },

  getCollaborations: async () => {
    return getDocsData<Collaboration>(collection(db, 'collaborations'));
  },

  updateCollaboration: async (collabId: string, status: string) => {
    const docRef = doc(db, 'collaborations', collabId);
    await updateDoc(docRef, { status });
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Collaboration;
  },
};

// ============================================================================
// CHAT API
// ============================================================================

export const chatApi = {
  createChat: async (otherUserId: string) => {
    const chatData = {
      participants: [otherUserId], // Should include current user too
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'chats'), chatData);
    return { chatId: docRef.id };
  },

  sendMessage: async (toUserId: string, content: string, chatId?: string) => {
    // If no chatId, create one or find one
    let targetChatId = chatId;
    if (!targetChatId) {
      // Simple logic: create new (in reality check if exists)
      const newChat = await chatApi.createChat(toUserId);
      targetChatId = newChat.chatId;
    }

    const msgData = {
      chatId: targetChatId,
      toUserId,
      content,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Add to subcollection or top-level messages collection
    const docRef = await addDoc(collection(db, 'messages'), msgData);
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Message;
  },

  getMessages: async (chatId: string) => {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    return getDocsData<Message>(q);
  },

  subscribeToMessages: (chatId: string, callback: (messages: Message[]) => void) => {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  },

  subscribeToChats: (userId: string, callback: (chats: any[]) => void) => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        // Find other participant
        const otherUserId = data.participants.find((p: string) => p !== userId);
        let otherUser = null;

        if (otherUserId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            if (userDoc.exists()) {
              otherUser = { id: userDoc.id, ...userDoc.data() };
            }
          } catch (e) {
            console.error('Error fetching chat user:', e);
          }
        }

        return {
          id: docSnapshot.id,
          userId: otherUserId,
          user: otherUser,
          unreadCount: data.unreadCounts?.[userId] || 0,
          lastMessage: data.lastMessage,
          updatedAt: data.updatedAt
        };
      }));

      callback(chats);
    });
  },

  markAsRead: async (chatId: string, userId: string) => {
    // 1. Update messages status
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('toUserId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batchPromises = snapshot.docs.map(doc => updateDoc(doc.ref, { read: true }));
    await Promise.all(batchPromises);

    // 2. Reset unread count on chat document
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCounts.${userId}`]: 0
    });

    return { success: true, updatedCount: snapshot.size };
  },
};

// ============================================================================
// PAYMENT & ESCROW API
// ============================================================================

export const paymentApi = {
  createConnectAccount: async () => {
    // This typically requires a backend Cloud Function/Server to talk to Stripe
    console.warn("Stripe Connect requires backend. Implement Firebase Cloud Function.");
    return { url: '#' };
  },

  createEscrow: async (collaborationId: string, amount: number, currency = 'czk') => {
    console.warn("Escrow requires backend. Implement Firebase Cloud Function.");
    return { escrow: {}, clientSecret: 'mock_secret' };
  },

  releaseEscrow: async (escrowId: string) => {
    console.warn("Escrow release requires backend. Implement Firebase Cloud Function.");
    return { success: true, escrow: {} };
  },
};

// ============================================================================
// RATING API
// ============================================================================

export const ratingApi = {
  createRating: async (
    collaborationId: string,
    toUserId: string,
    rating: number,
    comment?: string
  ) => {
    const ratingData = { collaborationId, toUserId, rating, comment, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'ratings'), ratingData);
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Rating;
  },
};

// ============================================================================
// NOTIFICATION API
// ============================================================================

export const notificationApi = {
  getNotifications: async () => {
    // Should filter by current user
    return getDocsData<Notification>(collection(db, 'notifications'));
  },

  markAsRead: async (notificationId: string) => {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as Notification;
  },

  markAllAsRead: async () => {
    // Similar to messages, careful with batch updates
    // skipping implementation for brevity, typically "update all where user == me"
    return { success: true, count: 0 };
  },
};

// ============================================================================
// CONTRACT API
// ============================================================================

export const contractApi = {
  createContract: async (data: Partial<Contract>) => {
    const docRef = await addDoc(collection(db, 'contracts'), data);
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Contract;
  },

  getContracts: async () => {
    return getDocsData<Contract>(collection(db, 'contracts'));
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  getTalentAnalytics: async (userId: string) => {
    // In real app, aggregate data via Cloud Functions
    return {};
  },

  getCompanyAnalytics: async (userId: string) => {
    return {};
  },
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  getAllUsers: async () => {
    return getDocsData<User>(collection(db, 'users'));
  },

  getStats: async () => {
    return {};
  },

  getPendingKYC: async () => {
    const q = query(collection(db, 'kyc_documents'), where('status', '==', 'pending'));
    return getDocsData<KYCDocument>(q);
  },

  getAllProjects: async () => {
    return getDocsData<Project>(collection(db, 'projects'));
  },

  getAllCollaborations: async () => {
    return getDocsData<Collaboration>(collection(db, 'collaborations'));
  },

  getAllTransactions: async () => {
    return getDocsData<Transaction>(collection(db, 'transactions'));
  },


  updateUser: async (userId: string, data: Partial<User>) => {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() } as User;
  },

  deleteUser: async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  },
};

// ============================================================================
// STORAGE API
// ============================================================================

export const storageApi = {
  uploadAvatar: async (file: File) => {
    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return { url };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  uploadAttachment: async (file: File) => {
    try {
      const storageRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      return {
        url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error("Error uploading attachment:", error);
      throw error;
    }
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async () => {
  return { status: 'ok', timestamp: new Date().toISOString(), stripe: 'mock' };
};
