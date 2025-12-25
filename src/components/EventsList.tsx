
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-x-hidden">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                            Události & Eventy
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl">
                            Objevte exkluzivní akce, castingy a networkingová setkání. 
                            Propojujeme svět byznysu s kreativitou na živých akcích.
                        </p>
                    </div>

                    {/* Create Button (For Companies) */}
                    {currentUser?.role === 'company' && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-base px-6 py-6 h-auto rounded-xl">
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

                {/* "How it works" Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white/60 backdrop-blur border-blue-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Dění v okolí</h3>
                                <p className="text-sm text-gray-600">Najděte vernisáže, koncerty a networkingy ve vašem městě.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur border-orange-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Práce na eventech</h3>
                                <p className="text-sm text-gray-600">Firmy poptávají talenty, hostesky i fotografy.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur border-purple-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Exkluzivní VIP</h3>
                                <p className="text-sm text-gray-600">Speciální pozvánky pouze pro ověřené členy Collabio.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Public Preview Banner (if not logged in) */}
                {!currentUser && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border-2 border-blue-200 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Ukázka pro veřejnost</h3>
                                <p className="text-gray-600 mb-4 md:mb-0">
                                    Prohlížíte si omezenou verzi událostí. Pro zobrazení detailů, kontaktů a možnost přihlášení se prosím registrujte.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button size="lg" onClick={() => onNavigate('register')} className="bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-lg">
                                    Registrovat zdarma
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => onNavigate('login')} className="border-blue-200 hover:bg-blue-50 text-blue-700">
                                    Přihlásit se
                                </Button>
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
                <div className="space-y-6">
                    {filteredEvents.map(event => (
                        <Card
                            key={event.id}
                            className={`group overflow-hidden transition-all hover:shadow-xl cursor-pointer border-0 ring-1 ${event.type === 'company_demand' ? 'ring-blue-100 hover:ring-blue-300' : 'ring-orange-100 hover:ring-orange-300'}`}
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
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">

                                    {/* Date / Image Section */}
                                    <div className="md:w-64 bg-gray-100 relative shrink-0 h-48 md:h-auto overflow-hidden">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        {event.type === 'talent_offer' ? (
                                            <>
                                                <img 
                                                    src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
                                                    alt={event.subtitle} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                />
                                                <div className="absolute top-0 left-0 bg-white/95 backdrop-blur-md px-4 py-3 rounded-br-2xl shadow-lg z-20">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-gray-900 leading-none">{formatDateDay(event.date)}</div>
                                                        <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">{formatDateMonth(event.date)}</div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white relative">
                                                <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
                                                    {formatDateDay(event.date)} {formatDateMonth(event.date)}
                                                </div>
                                                <Avatar className="w-20 h-20 mb-3 ring-4 ring-white shadow-lg">
                                                    <AvatarImage src={event.imageUrl} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-xl">
                                                        {event.subtitle[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="px-3 py-1 rounded-full bg-white/80 backdrop-blur text-xs font-semibold text-gray-600 shadow-sm">
                                                    Firemní Event
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative">
                                        {/* Top Badge */}
                                        <div className="flex justify-between items-start mb-3">
                                             <Badge variant="outline" className={`mb-2 ${event.type === 'company_demand' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                {event.type === 'company_demand' ? 'Poptávka' : 'Nabídka'}
                                            </Badge>
                                            
                                            {!currentUser && (
                                                <Lock className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                       
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-orange-500 transition-all mb-2">
                                            {event.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium mb-4">
                                            {event.type === 'company_demand' ? (
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                                    <span>{event.subtitle}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-orange-500" />
                                                    <span>{event.subtitle}</span>
                                                </div>
                                            )}
                                            {event.location && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        {event.location}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-gray-600 line-clamp-2 mb-6 text-sm leading-relaxed">
                                            {event.description}
                                        </p>

                                        {/* Action Area */}
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            {currentUser ? (
                                                <>
                                                    <div className="font-semibold text-gray-900">
                                                        {event.type === 'company_demand' ? 'Rozpočet dohodou' : 'Cena v profilu'}
                                                    </div>
                                                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                                        Zobrazit detail <ArrowRight className="w-4 h-4 ml-1" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full text-center text-sm font-medium text-gray-500 italic bg-gray-50 py-2 rounded-lg">
                                                    Pro zobrazení ceny se přihlaste
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
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
