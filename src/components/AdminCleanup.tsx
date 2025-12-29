import { useState } from 'react';
import { clearDatabase } from '../services/firestore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminCleanup() {
    const [loading, setLoading] = useState(false);
    const { user, refreshUser } = useAuth();

    const handleClear = async () => {
        if (!user) {
            toast.error("Musíte být přihlášen");
            return;
        }

        if (!window.confirm("VAROVÁNÍ: Tato akce vymaže VŠECHNA data z databáze (uživatele, projekty, zprávy...). Opravdu pokračovat?")) {
            return;
        }

        setLoading(true);
        try {
            // Exclude current user from deletion to maintain session and permissions
            await clearDatabase([user.id]);
            toast.success("Databáze byla vyčištěna (Váš účet byl zachován).");
        } catch (error: any) {
            console.error(error);
            toast.error("Chyba při čištění databáze: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const makeMeAdmin = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.id), {
                role: 'admin'
            });
            await refreshUser();
            toast.success("Nyní jste Admin! Zkuste vymazat databázi znovu.");
        } catch (error: any) {
            console.error(error);
            toast.error("Chyba při změně role: " + error.message);
        }
    };

    return (
        <div className="container mx-auto p-8 flex items-center justify-center min-h-[500px]">
            <Card className="w-full max-w-md border-red-200 shadow-xl bg-red-50">
                <CardHeader>
                    <CardTitle className="text-red-700">Admin Nástroje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-red-600 font-medium">
                        Tento nástroj slouží k odstranění starých dat (mock data), která zůstala v databázi.
                    </p>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleClear}
                        disabled={loading}
                    >
                        {loading ? "Čištění..." : "🗑️ Vymazat celou databázi"}
                    </Button>

                    {user && user.role !== 'admin' && (
                        <div className="pt-4 border-t border-red-200">
                            <p className="text-sm text-red-600 font-medium mb-2">
                                Data může mazat pouze Admin. Vy jste momentálně "{user.role}".
                            </p>
                            <Button
                                variant="outline"
                                className="w-full border-red-300 text-red-700 hover:bg-red-100"
                                onClick={makeMeAdmin}
                            >
                                👑 Nastavit mě jako Admina (Debug)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
