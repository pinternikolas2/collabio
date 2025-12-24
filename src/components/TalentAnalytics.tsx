import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  TrendingUp,
  Award,
  BarChart3,
  DollarSign,
  Star,
  Users,
  Target,
  Calendar,
  ArrowLeft,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import type { TalentAnalytics as AnalyticsType } from '../types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TalentAnalyticsProps {
  userId: string;
  onNavigate: (page: string, data?: any) => void;
}

// Mock data
const mockAnalytics: AnalyticsType = {
  userId: '1',
  totalCollaborations: 23,
  completedCollaborations: 21,
  averageRating: 4.8,
  totalReach: 2500000,
  averageEngagementRate: 7.5,
  totalEarnings: 850000,
  averageCPM: 340,
  topCategories: ['Sport', 'Lifestyle', 'Fashion'],
  badges: [
    {
      id: 'b1',
      name: 'Top Performer',
      description: '20+ úspěšných spoluprací',
      icon: '🏆',
      earnedAt: '2024-12-01',
    },
    {
      id: 'b2',
      name: 'Trusted Talent',
      description: '95%+ spokojenost klientů',
      icon: '⭐',
      earnedAt: '2024-11-15',
    },
    {
      id: 'b3',
      name: 'Rising Star',
      description: '+50% růst followersů',
      icon: '🌟',
      earnedAt: '2024-10-20',
    },
  ],
  followersGrowth: [
    { date: '2024-07', count: 45000, platform: 'instagram' as const },
    { date: '2024-08', count: 52000, platform: 'instagram' as const },
    { date: '2024-09', count: 61000, platform: 'instagram' as const },
    { date: '2024-10', count: 72000, platform: 'instagram' as const },
    { date: '2024-11', count: 85000, platform: 'instagram' as const },
    { date: '2024-12', count: 98000, platform: 'instagram' as const },
    { date: '2025-01', count: 115000, platform: 'instagram' as const },
  ],
};

export default function TalentAnalytics({ userId, onNavigate }: TalentAnalyticsProps) {
  const analytics = mockAnalytics;
  const completionRate = (analytics.completedCollaborations / analytics.totalCollaborations) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na profil
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent mb-2">
            📊 Analytika profilu
          </h1>
          <p className="text-gray-600">
            Kompletní přehled vašeho výkonu a dosažených úspěchů
          </p>
        </div>

        {/* Badges */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Získané odznaky
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {analytics.badges.map((badge) => (
              <Card key={badge.id} className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <p className="text-xs text-gray-500">
                      Získáno {new Date(badge.earnedAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Celkový dosah</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{(analytics.totalReach / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500 mt-1">Napříč {analytics.totalCollaborations} spoluprací</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Průměrný ER</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{analytics.averageEngagementRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Engagement Rate</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Hodnocení</p>
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(analytics.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Spokojenost klientů</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Celkový výdělek</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{(analytics.totalEarnings / 1000).toFixed(0)}K Kč</p>
            <p className="text-xs text-gray-500 mt-1">Za {analytics.completedCollaborations} projektů</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Followers Growth Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Růst sledujících (Instagram)
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.followersGrowth}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorFollowers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">
                +{((analytics.followersGrowth[analytics.followersGrowth.length - 1].count - 
                   analytics.followersGrowth[0].count) / 1000).toFixed(1)}K sledujících
              </p>
              <p className="text-xs text-blue-700">
                Růst za posledních 7 měsíců (+
                {(((analytics.followersGrowth[analytics.followersGrowth.length - 1].count - 
                   analytics.followersGrowth[0].count) / analytics.followersGrowth[0].count) * 100).toFixed(1)}%)
              </p>
            </div>
          </Card>

          {/* Performance Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Statistiky výkonu
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Míra dokončení projektů</span>
                  <span className="font-semibold">{completionRate.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.completedCollaborations} z {analytics.totalCollaborations} spoluprací
                </p>
              </div>
              
              <Separator />
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Průměrná cena za dosah</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageCPM} Kč</p>
                <p className="text-xs text-gray-500 mt-1">CPM (Cost per 1000 impressions)</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Průměrný výdělek na projekt</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(analytics.totalEarnings / analytics.completedCollaborations / 1000).toFixed(1)}K Kč
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Za posledních {analytics.completedCollaborations} projektů
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Categories */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Nejúspěšnější kategorie
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {analytics.topCategories.map((category, index) => (
              <Badge 
                key={category}
                className={`px-4 py-2 text-sm ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                    : 'bg-gradient-to-r from-orange-300 to-orange-400 text-gray-900'
                }`}
              >
                {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'} {category}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 Chcete zlepšit své výsledky?</h2>
          <p className="mb-6 text-blue-50">
            Využijte našeho AI poradce pro personalizovaná doporučení, jak zvýšit engagement a výdělek
          </p>
          <Button 
            onClick={() => {/* AI assistant would open */}}
            className="bg-white text-blue-600 hover:bg-gray-100"
            size="lg"
          >
            <Award className="w-5 h-5 mr-2" />
            Získat AI doporučení
          </Button>
        </div>
      </div>
    </div>
  );
}
