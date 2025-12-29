import {
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    addDoc,
    orderBy,
    limit,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Project, User, Collaboration } from '../types';

// Collection References
const usersRef = collection(db, 'users');
const projectsRef = collection(db, 'projects');
const collaborationsRef = collection(db, 'collaborations');

// --- Users ---

export const getUsers = async (role?: 'talent' | 'company'): Promise<User[]> => {
    try {
        let q = query(usersRef);
        if (role) {
            q = query(usersRef, where('role', '==', role));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const getUserById = async (userId: string): Promise<User | null> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

// --- Projects ---

export const getProjects = async (): Promise<Project[]> => {
    try {
        // In a real app, you might want pagination or filtering here
        const q = query(projectsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
};

export const createProject = async (projectData: Omit<Project, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(projectsRef, {
            ...projectData,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

// --- Seeding ---
// Seed data removed as requested.

export const clearDatabase = async (excludeIds: string[] = []) => {
    console.log("Starting database cleanup...");
    const collections = ['users', 'projects', 'collaborations', 'transactions', 'ratings', 'kyc_documents', 'events', 'contracts', 'notifications', 'messages', 'chats'];

    for (const colName of collections) {
        const q = query(collection(db, colName));
        const snapshot = await getDocs(q);

        const batchPromises = snapshot.docs.map(doc => {
            if (colName === 'users' && excludeIds.includes(doc.id)) {
                console.log(`Skipping deletion of safe user: ${doc.id}`);
                return Promise.resolve();
            }
            return deleteDoc(doc.ref);
        });

        await Promise.all(batchPromises);
        console.log(`Cleared collection: ${colName}`);
    }

    console.log("Database cleanup completed!");
};

export const createAdminProfile = async (userId: string, email: string) => {
    try {
        const adminData: User = {
            id: userId,
            email: email,
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            verified: true,
            emailVerified: true,
            verificationStatus: 'verified',
            profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', userId), adminData);
        console.log("Admin profile created successfully");
        return adminData;
    } catch (error) {
        console.error("Error creating admin profile:", error);
        throw error;
    }
};
