import { useState } from 'react';
import { clearDatabase, createAdminProfile } from '../services/firestore'; // Check path
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

export default function AdminCleanup() {
    const [loading, setLoading] = useState(false);

    const handleClear = async () => {
        if (!window.confirm("VAROVÁNÍ: Tato akce vymaže VŠECHNA data z databáze (uživatele, projekty, zprávy...). Opravdu pokračovat?")) {
            return;
        }

        setLoading(true);
        try {
            await clearDatabase();
            toast.success("Databáze byla vyčištěna.");
        } catch (error) {
            console.error(error);
            toast.error("Chyba při čištění databáze.");
        } finally {
            setLoading(false);
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
                </CardContent>
            </Card>
        </div>
    );
}
