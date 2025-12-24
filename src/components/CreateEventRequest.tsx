
import React, { useState } from 'react';
import { Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { projectApi } from '../utils/api'; // Mock API

export default function CreateEventRequest({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [budget, setBudget] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // Create project with specific category 'event_demand'
            await projectApi.createProject({
                title,
                description,
                category: 'event_demand', // Special category for event demands
                eventDate: date,
                location: location,
                price: budget ? parseInt(budget) : undefined,
                ownerId: user.id,
                tags: ['event', 'demand'],
                available: true,
                published: true
            });

            toast.success('Poptávka byla úspěšně vytvořena!');
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Chyba při vytváření poptávky');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
                <Label>Název akce / Co hledáte</Label>
                <Input
                    required
                    placeholder="Např. Hledáme moderátora na firemní večírek"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Datum konání</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            required
                            type="date"
                            className="pl-9"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Lokalita</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            required
                            placeholder="Praha, Brno..."
                            className="pl-9"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Popis a požadavky</Label>
                <Textarea
                    required
                    placeholder="Popište vaši akci a koho přesně hledáte..."
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Orientační rozpočet (CZK)</Label>
                <Input
                    type="number"
                    placeholder="Např. 5000"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Vytvořit poptávku'}
            </Button>
        </form>
    );
}
