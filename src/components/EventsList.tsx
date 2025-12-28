
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Search, Filter, Lock, Plus, ArrowRight, Briefcase, Star, Sparkles, Trophy, ExternalLink } from 'lucide-react';
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
import { userApi, projectApi, eventApi } from '../utils/api'; // Assuming you have projectApi or similar
import { User, Project, Event } from '../types';
import CreateEventRequest from './CreateEventRequest'; // Will create next
// import { mockEvents, mockProjects, mockUsers } from '../data/seedData'; // Removed mock data fallback


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
                // 1. Get Talent Events (Offers) from API
                const eventsData = await eventApi.getAllEvents();
                // We need to fetch owner details for each event usually, but for now we might rely on what comes back or separate fetching
                // Optimization: fetch all relevant users or fetch individually. For simple prototype, fetching one by one is okay or better: fetch all users once.

                // Let's fetch all users for mapping (perf warning for large apps)
                const users = await userApi.getTalents(); // Simplified: assume we get all relevant users (or companies)
                const companies = await userApi.getCompanies();
                const allUsers = [...users, ...companies];

                const talentEvents = eventsData.map(e => {
                    const owner = allUsers.find(u => u.id === e.userId);
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

                // 2. Get Company Event Demands from Projects
                const projectsData = await projectApi.getProjects();
                const companyDemands = projectsData.filter(p => isEventDemand(p)).map(p => {
                    const owner = allUsers.find(u => u.id === p.ownerId);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                            Události & Eventy
                        </h1>
                        <p className="text-gray-600">
                            Najděte nadcházející události, jako jsou zápasy bojovníků,
                            a využijte možnost zakoupit si reklamní místo na jejich plachtě nebo dresu.
                        </p>
                    </div>

                    {/* Create Button (For Companies) */}
                    {currentUser?.role === 'company' && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Vytvořit událost
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



                {/* Public Preview Banner (if not logged in) */}
                {!currentUser && (
                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border-2 border-blue-300 shadow-md">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
                                <span className="text-white text-xl">🔒</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{t('marketplace.preview_title')}</h3>
                                <p className="text-sm text-gray-700 mb-3">
                                    {t('marketplace.preview_desc')}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => onNavigate('register')}
                                        className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                                    >
                                        {t('marketplace.register_action')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onNavigate('login')}
                                    >
                                        {t('navigation.login')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search & Filters Card */}
                <Card className="mb-8 shadow-lg border-0">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Search */}
                            <div className="relative w-full md:flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="Hledat událost, talent nebo lokalitu..."
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 w-full md:w-auto overflow-x-auto">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Vše
                                </button>
                                <button
                                    onClick={() => setFilter('talent_offer')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'talent_offer' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Nabídky talentů
                                </button>
                                <button
                                    onClick={() => setFilter('company_demand')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${filter === 'company_demand' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <Briefcase className="w-3.5 h-3.5" />
                                    Poptávky firem
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredEvents.map(event => (
                        <Card
                            key={event.id}
                            className={`group overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 hover:border-blue-500 relative bg-white flex flex-col h-full`}
                            onClick={() => {
                                if (!currentUser) {
                                    onNavigate('register');
                                    return;
                                }
                                if (event.type === 'talent_offer') {
                                    onNavigate('talent-profile', { userId: event.ownerId });
                                } else {
                                    onNavigate('company-profile', { userId: event.ownerId });
                                }
                            }}
                        >
                            {/* Image / Date Header */}
                            <div className="relative h-40 overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>

                                {event.type === 'talent_offer' ? (
                                    <img
                                        src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                                        alt={event.subtitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white relative group-hover:scale-110 transition-transform duration-500">
                                        <Avatar className="w-20 h-20 mb-3 ring-4 ring-white shadow-lg">
                                            <AvatarImage src={event.imageUrl} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xl">
                                                {event.subtitle[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                )}

                                {/* Date Badge Overlay */}
                                <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg flex flex-col items-center border border-gray-100">
                                    <div className="text-xl font-black text-gray-900 leading-none">{formatDateDay(event.date)}</div>
                                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{formatDateMonth(event.date)}</div>
                                </div>

                                {/* Type Badge */}
                                <Badge className={`absolute top-3 right-3 z-20 shadow-sm ${event.type === 'company_demand'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-orange-500 hover:bg-orange-600'
                                    }`}>
                                    {event.type === 'company_demand' ? (
                                        <><Briefcase className="w-3 h-3 mr-1" /> Poptávka</>
                                    ) : (
                                        <><Sparkles className="w-3 h-3 mr-1" /> Nabídka</>
                                    )}
                                </Badge>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                                    {event.type === 'company_demand' ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{event.subtitle}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                            <Star className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{event.subtitle}</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                    {event.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">{event.location || 'Online / Neuvedeno'}</span>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                                    {event.description}
                                </p>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                    {currentUser ? (
                                        <>
                                            <div className="font-bold text-gray-900">
                                                {event.type === 'company_demand' ? 'Rozpočet dohodou' : 'Cena v profilu'}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full text-center text-xs font-semibold text-gray-400 italic">
                                            <Lock className="w-3 h-3 inline-block mr-1" />
                                            Přihlaste se pro detail
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Žádné události nenalezeny</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Zkuste změnit filtry nebo hledaný výraz. Momentálně nemáme žádné akce odpovídající vašemu zadání.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
