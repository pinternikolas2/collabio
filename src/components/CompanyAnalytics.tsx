import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  Target,
  ArrowLeft,
  RefreshCw,
  Award,
  Eye,
} from 'lucide-react';
import type { CompanyAnalytics as AnalyticsType } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CompanyAnalyticsProps {
  userId: string;
  onNavigate: (page: string, data?: any) => void;
}

// Mock data
// Initial empty state for analytics
const mockAnalytics: AnalyticsType = {
  userId: '6',
  totalBudgetSpent: 0,
  activeCampaigns: 0,
  completedCampaigns: 0,
  averageEngagementRate: 0,
  averageCompletionTime: 0,
  totalReach: 0,
  averageROI: 0,
  topPerformingTalents: [],
};

// Mock data removed
const campaignPerformanceData: any[] = [];

export default function CompanyAnalytics({ userId, onNavigate }: CompanyAnalyticsProps) {
  const analytics = mockAnalytics;
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '1y' | 'all'>('6m');

  const handleRestartCampaign = (talentId: string) => {
    onNavigate('create-project', { targetUserId: talentId });
  };

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

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent mb-2">
                📊 Analytika kampaní
              </h1>
              <p className="text-gray-600">
                Kompletní přehled vašich marketingových investic a výsledků
              </p>
            </div>

            <div className="flex gap-2">
              {(['6m', '1y', 'all'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? 'bg-gradient-to-r from-blue-600 to-orange-500' : ''}
                >
                  {period === '6m' ? '6 měsíců' : period === '1y' ? '1 rok' : 'Vše'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Celkový rozpočet</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {(analytics.totalBudgetSpent / 1000000).toFixed(1)}M Kč
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Napříč {analytics.activeCampaigns + analytics.completedCampaigns} kampaněmi
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Průměrný ROI</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">+{analytics.averageROI}%</p>
            <p className="text-xs text-green-700 mt-1">Návratnost investice</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Celkový dosah</p>
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {(analytics.totalReach / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-purple-700 mt-1">Oslovených lidí</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-700">Aktivní kampaně</p>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{analytics.activeCampaigns}</p>
            <p className="text-xs text-orange-700 mt-1">
              {analytics.completedCampaigns} dokončených
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Campaign Performance Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Výkon kampaní v čase
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={campaignPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="budget"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Rozpočet (Kč)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roi"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="ROI (%)"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Průměrný rozpočet</p>
                <p className="text-lg font-bold text-blue-600">
                  {campaignPerformanceData.length > 0
                    ? (campaignPerformanceData.reduce((acc, d) => acc + d.budget, 0) / campaignPerformanceData.length / 1000).toFixed(0) + 'K Kč'
                    : '0 Kč'}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Průměrný ROI</p>
                <p className="text-lg font-bold text-green-600">
                  +{campaignPerformanceData.length > 0
                    ? (campaignPerformanceData.reduce((acc, d) => acc + d.roi, 0) / campaignPerformanceData.length).toFixed(0)
                    : '0'}%
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Klíčové metriky
            </h2>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Průměrný Engagement Rate
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {analytics.averageEngagementRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Míra zapojení publika napříč všemi kampaněmi
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Průměrný čas dokončení
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {analytics.averageCompletionTime} dní
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Od briefingu po finální dodání
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Cena za dosah 1M
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {analytics.totalReach > 0
                      ? (analytics.totalBudgetSpent / (analytics.totalReach / 1000000) / 1000).toFixed(0)
                      : '0'}K Kč
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Efektivita marketingových investic
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performing Talents */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Nejlepší talenty
            </h2>
            <p className="text-sm text-gray-600">
              Seřazeno podle výkonu
            </p>
          </div>

          <div className="space-y-4">
            {analytics.topPerformingTalents.map((talent, index) => (
              <div
                key={talent.userId}
                className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                    <div className="text-2xl">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.userId}`} />
                      <AvatarFallback>{talent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{talent.name}</p>
                      <p className="text-sm text-gray-600">
                        {(talent.totalReach / 1000).toFixed(0)}K dosah • {talent.engagementRate.toFixed(1)}% ER
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 sm:gap-0">
                    <div>
                      <p className="font-semibold text-lg">
                        {(talent.totalSpent / 1000).toFixed(0)}K Kč
                      </p>
                      <p className="text-xs text-gray-500">Investováno</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestartCampaign(talent.userId)}
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Opakovat
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Dosah</p>
                      <p className="font-semibold text-blue-600">
                        {(talent.totalReach / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Engagement</p>
                      <p className="font-semibold text-green-600">
                        {talent.engagementRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">CPM</p>
                      <p className="font-semibold text-purple-600">
                        {talent.totalReach > 0 ? (talent.totalSpent / (talent.totalReach / 1000)).toFixed(0) : 0} Kč
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">💡 Chcete optimalizovat své kampaně?</h2>
          <p className="mb-6 text-blue-50">
            Využijte AI poradce pro doporučení nejlepších talentů a strategií založených na vašich datech
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => onNavigate('marketplace')}
              className="bg-white text-blue-600 hover:bg-gray-100"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Najít talenty
            </Button>
            <Button
              onClick={() => {/* AI assistant would open */ }}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              size="lg"
            >
              <Award className="w-5 h-5 mr-2" />
              AI doporučení
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
