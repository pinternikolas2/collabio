import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

export default function DebugDB() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const usersSnap = await getDocs(collection(db, 'users'));
            const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const projectsSnap = await getDocs(collection(db, 'projects'));
            const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            setData({
                usersCount: users.length,
                projectsCount: projects.length,
                users: users,
                projects: projects
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Database Debugger</h1>
            <Button onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Fetch DB Data'}
            </Button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {data && (
                <div className="mt-8 space-y-8">
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-xl font-bold">Summary</h2>
                            <p>Users: {data.usersCount}</p>
                            <p>Projects: {data.projectsCount}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-xl font-bold mb-2">Users (First 5)</h2>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(data.users.slice(0, 5), null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-xl font-bold mb-2">Projects (First 5)</h2>
                            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                                {JSON.stringify(data.projects.slice(0, 5), null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
