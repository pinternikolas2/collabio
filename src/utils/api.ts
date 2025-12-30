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
    userId: string,
    file: File,
    documentType: string,
    ico?: string,
    companyName?: string
  ) => {
    console.log('[KYC] Uploading document for user:', userId);

    // 1. Upload file to Firebase Storage
    // Structure: kyc/{userId}/{timestamp}_{filename}
    const storageRef = ref(storage, `kyc/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(snapshot.ref);

    // 2. Create document record in Firestore
    const docData = {
      userId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      status: 'pending', // Default status
      fileUrl,
      uploadedAt: new Date().toISOString(),
      ...(ico ? { ico } : {}),
      ...(companyName ? { companyName } : {})
    };

    const docRef = await addDoc(collection(db, 'kyc_documents'), docData);
    const newDoc = await getDoc(docRef);

    console.log('[KYC] Document record created:', newDoc.id);

    return { id: newDoc.id, ...newDoc.data() } as KYCDocument;
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
      where('participants', 'array-contains', userId)
      // orderBy('updatedAt', 'desc') // Removed to avoid missing index error
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

      // Client-side sort
      chats.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });

      callback(chats);
    }, (error) => {
      console.error("Error subscribing to chats:", error);
      // Callback with empty list to stop loading spinner
      callback([]);
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
    try {
      const createAccount = httpsCallable(functions, 'createConnectAccount');
      const result = await createAccount({});
      return result.data as { url: string, accountId: string };
    } catch (error) {
      console.error('Payment API Error:', error);
      throw error;
    }
  },

  createEscrow: async (amount: number, currency: string, destinationAccountId: string) => {
    try {
      console.log('Creating escrow:', { amount, currency, destinationAccountId });
      const createEscrowFn = httpsCallable(functions, 'createEscrow');
      const result = await createEscrowFn({ amount, currency, destinationAccountId });
      return result.data as { clientSecret: string, id: string };
    } catch (error) {
      console.error('Escrow API Error:', error);
      throw error;
    }
  },

  releaseEscrow: async (paymentIntentId: string) => {
    try {
      const releaseFn = httpsCallable(functions, 'releaseEscrow');
      const result = await releaseFn({ paymentIntentId });
      return result.data as { success: boolean };
    } catch (error) {
      console.error('Release Escrow API Error:', error);
      throw error;
    }
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

  getPlatformSettings: async () => {
    const docRef = doc(db, 'config', 'platform');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { minProjectPrice: 5000, escrowReleaseDays: 30 }; // Defaults
  },

  updatePlatformSettings: async (settings: any) => {
    const docRef = doc(db, 'config', 'platform');
    await setDoc(docRef, settings, { merge: true });
    return settings;
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
// AI API - Firestore Triggered (Gemini Extension)
// ============================================================================

export const aiApi = {
  /**
   * Sends a message to the AI by creating a document in Firestore.
   * The 'Build Chatbot with Gemini' extension listens to this collection
   * and updates the document with the response.
   */
  sendAIQuery: async (userId: string, message: string, history: any[] = []) => {
    try {
      // Create a document in a collection monitored by the Extension
      // Recommended path: users/{uid}/discussions/{discussionId}/messages
      // Or simple flat collection: ai_messages

      const docData = {
        userId,
        prompt: message, // 'prompt' field as required by the extension default
        history, // Optional: if extension supports history context
        createdAt: new Date().toISOString(),
        status: { state: 'PROCESSING' } // Extension updates this
      };

      const docRef = await addDoc(collection(db, 'ai_messages'), docData);
      return { id: docRef.id };
    } catch (error) {
      console.error("AI API Error:", error);
      throw error;
    }
  }
};

// ============================================================================
// EVENT API
// ============================================================================

export const eventApi = {
  createEvent: async (data: Partial<Event>) => {
    const docRef = await addDoc(collection(db, 'events'), {
      ...data,
      advertisingOptions: data.advertisingOptions || [],
      createdAt: new Date().toISOString()
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...newDoc.data() } as Event;
  },

  getAllEvents: async () => {
    // In real app, filter by date >= today
    const q = query(collection(db, 'events'), orderBy('startDate', 'asc'));
    return getDocsData<Event>(q);
  },

  getUserEvents: async (userId: string) => {
    const q = query(collection(db, 'events'), where('userId', '==', userId));
    return getDocsData<Event>(q);
  },

  deleteEvent: async (eventId: string) => {
    await deleteDoc(doc(db, 'events', eventId));
    return { success: true };
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async () => {
  return { status: 'ok', timestamp: new Date().toISOString(), stripe: 'mock' };
};
