
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Search, Filter, Lock, Plus, ArrowRight } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { userApi, projectApi } from '../utils/api'; // Assuming you have projectApi or similar
import { User, Project, Event } from '../types';
import CreateEventRequest from './CreateEventRequest'; // Will create next
import { mockEvents, mockProjects, mockUsers } from '../data/seedData'; // Fallback / mock data

// Helper to check if a project is an "Event Demand" (poptávka po talentu na akci)
const isEventDemand = (p: Project) => p.category === 'event_demand';

type UnifiedEvent = {
    id: string;
    type: 'talent_offer' | 'company_demand';
    date: string; // ISO date
    title: string;
    subtitle: string; // Talent name or Company Name
    description: string;
    imageUrl?: string; // Talent photo or Company Logo
    location?: string;
    originalData: Event | Project;
    ownerId: string;
};

export default function EventsList({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'talent_offer' | 'company_demand'>('all');
    const [events, setEvents] = useState<UnifiedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Get Talent Events (Offers) from mockEvents (or API)
                // In real app: fetch all public events. For now filter mockEvents.
                const talentEvents = mockEvents.filter(e => e.public).map(e => {
                    const owner = mockUsers.find(u => u.id === e.userId);
                    return {
                        id: e.id,
                        type: 'talent_offer' as const,
                        date: e.startDate,
                        title: e.title,
                        subtitle: owner ? `${owner.firstName} ${owner.lastName}` : 'Neznámý talent',
                        description: e.description,
                        imageUrl: owner?.profileImage,
                        location: e.location, // Event has 'location' field
                        originalData: e,
                        ownerId: e.userId
                    };
                });

                // 2. Get Company Event Demands from mockProjects (or API)
                const companyDemands = mockProjects.filter(p => isEventDemand(p)).map(p => {
                    const owner = mockUsers.find(u => u.id === p.ownerId);
                    return {
                        id: p.id,
                        type: 'company_demand' as const,
                        date: p.eventDate || p.createdAt || new Date().toISOString(), // Fallback
                        title: p.title,
                        subtitle: owner?.companyName || owner ? `${owner.firstName} ${owner.lastName}` : 'Neznámá firma',
                        description: p.description,
                        imageUrl: owner?.profileImage, // Using profile image (logo for company)
                        location: p.location,
                        originalData: p,
                        ownerId: p.ownerId
                    };
                });

                // Merge and Sort
                const allEvents = [...talentEvents, ...companyDemands].sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                setEvents(allEvents);
            } catch (error) {
                console.error("Failed to load events", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter logic
    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filter === 'all' || event.type === filter;

        return matchesSearch && matchesFilter;
    });

    const formatDateDay = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.getDate();
    };

    const formatDateMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('cs-CZ', { month: 'short' }).toUpperCase().replace('.', '');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-white border-b static md:sticky md:top-16 z-30">
                <div className="container mx-auto px-4 py-4 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Události</h1>

                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Hledat událost, talent nebo lokalitu..."
                                className="pl-9 bg-gray-50 border-gray-200"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Create Button (For Companies) */}
                        {currentUser?.role === 'company' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md hover:shadow-lg transition-all">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Přidat poptávku
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Vytvořit poptávku na událost</DialogTitle>
                                    </DialogHeader>
                                    <CreateEventRequest onSuccess={() => window.location.reload()} />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className="rounded-full text-xs font-medium"
                            size="sm"
                        >
                            Vše
                        </Button>
                        <Button
                            variant={filter === 'talent_offer' ? 'default' : 'outline'}
                            onClick={() => setFilter('talent_offer')}
                            className="rounded-full text-xs font-medium"
                            size="sm"
                        >
                            Nabídky talentů
                        </Button>
                        <Button
                            variant={filter === 'company_demand' ? 'default' : 'outline'}
                            onClick={() => setFilter('company_demand')}
                            className="rounded-full text-xs font-medium"
                            size="sm"
                        >
                            Poptávky firem
                        </Button>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    {filteredEvents.map(event => (
                        <Card
                            key={event.id}
                            className={`overflow-hidden transition-all hover:shadow-md cursor-pointer group border-l-4 ${event.type === 'company_demand' ? 'border-l-blue-500' : 'border-l-orange-500'}`}
                            onClick={() => {
                                if (!currentUser) {
                                    onNavigate('register');
                                    return;
                                }
                                if (event.type === 'talent_offer') {
                                    onNavigate('talent-profile', { userId: event.ownerId });
                                } else {
                                    // Navigate to project detail (mocking behavior for now, maybe open dialog?)
                                    // For now, let's just create a toast or simple alert, or navigate if page exists
                                    // Assuming onNavigate supports 'project-detail' or similar? 
                                    // Fallback: Go to company profile
                                    onNavigate('company-profile', { userId: event.ownerId });
                                }
                            }}
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">

                                    {/* Date / Image Section */}
                                    <div className="sm:w-48 bg-gray-100 relative shrink-0">
                                        {event.type === 'talent_offer' ? (
                                            // Talent Offer Style: Photo dominant
                                            <>
                                                <img src={event.imageUrl} alt={event.subtitle} className="w-full h-48 sm:h-full object-cover" />
                                                <div className="absolute top-0 left-0 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-br-xl shadow-sm">
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold text-gray-900 leading-none">{formatDateDay(event.date)}</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase">{formatDateMonth(event.date)}</div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // Company Demand Style: Logo dominant
                                            <div className="w-full h-32 sm:h-full flex flex-col items-center justify-center p-6 bg-white border-r border-gray-100">
                                                <Avatar className="w-16 h-16 mb-3">
                                                    <AvatarImage src={event.imageUrl} />
                                                    <AvatarFallback>{event.subtitle[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold">
                                                    {formatDateDay(event.date)} {formatDateMonth(event.date)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                                    {event.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    {event.type === 'company_demand' ? (
                                                        <span className="text-blue-600">Poptává: {event.subtitle}</span>
                                                    ) : (
                                                        <span className="text-orange-600">{event.subtitle}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Badge */}
                                            <Badge variant={event.type === 'company_demand' ? 'default' : 'secondary'} className={event.type === 'company_demand' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}>
                                                {event.type === 'company_demand' ? 'Poptávka' : 'Nabídka'}
                                            </Badge>
                                        </div>

                                        {/* Location */}
                                        {event.location && (
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {event.location}
                                            </div>
                                        )}

                                        {/* Description (Truncated) */}
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                            {event.description}
                                        </p>

                                        {/* Footer / Lock */}
                                        <div className="mt-auto pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                                            {currentUser ? (
                                                <div className="flex items-center gap-4 text-sm font-medium text-gray-900">
                                                    {/* Price removed/hidden for request? "Cena/Rozpočet skryto pro neregistrované" -> logged in sees details */}
                                                    {event.type === 'company_demand' ? (
                                                        <span className="text-green-600">Rozpočet: Dle dohody</span> // Placeholder, could be from project
                                                    ) : (
                                                        <span className="text-gray-500">Více v profilu</span>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="hidden sm:flex ml-auto p-0 h-auto hover:bg-transparent hover:text-blue-600">
                                                        {event.type === 'company_demand' ? 'Zobrazit detail' : 'Přejít na profil'} <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="flex-1 h-8 bg-gray-100 rounded relative overflow-hidden group-hover:bg-gray-200 transition-colors">
                                                        <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
                                                            <Lock className="w-3 h-3" />
                                                            Detailní info po registraci
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-20">
                            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Žádné události nenalezeny</h3>
                            <p className="text-gray-500">Zkuste změnit filtry nebo hledaný výraz.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
