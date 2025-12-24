import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  BarChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Target,
  ArrowLeft,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { CollaborationReport as ReportType } from '../types';

interface CollaborationReportProps {
  reportId?: string
  collaborationId?: string
  userId?: string // Added to match App.tsx usage
  onNavigate: (page: string, data?: any) => void
}

// Mock data - would come from API
const mockReport: ReportType = {
  id: 'rep1',
  collaborationId: 'col1',
  talentId: '1',
  companyId: '6',
  projectId: 'proj1',
  postsCount: 3,
  totalReach: 125000,
  totalImpressions: 185000,
  totalEngagement: 15600,
  engagementRate: 8.43,
  likes: 12400,
  comments: 2100,
  shares: 1100,
  clicks: 3500,
  totalCost: 50000,
  estimatedRevenue: 125000,
  roi: 150,
  cpm: 270.27,
  briefingDate: '2025-01-05',
  publicationDate: '2025-01-12',
  completionDate: '2025-01-20',
  paymentDate: '2025-01-21',
  createdAt: '2025-01-20',
};

export default function CollaborationReport({ reportId, collaborationId, userId, onNavigate }: CollaborationReportProps) {
  const report = mockReport;

  const handleDownloadPDF = () => {
    // Would generate PDF in production
    alert('PDF report ke stažení připraven! (demo režim)');
  };

  const engagementBreakdown = [
    { label: 'Lajky', value: report.likes, icon: Heart, color: 'text-red-500' },
    { label: 'Komentáře', value: report.comments, icon: MessageCircle, color: 'text-blue-500' },
    { label: 'Sdílení', value: report.shares, icon: Share2, color: 'text-green-500' },
    { label: 'Kliknutí', value: report.clicks || 0, icon: Target, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('collaborations')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na spolupráce
          </Button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent mb-2">
                📊 Souhrnný Report Spolupráce
              </h1>
              <p className="text-gray-600">
                Kompletní přehled výkonu kampaně a dosažených výsledků
              </p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              className="bg-gradient-to-r from-blue-600 to-orange-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Stáhnout PDF
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Timeline spolupráce
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Briefing</p>
                  <p className="font-semibold">{new Date(report.briefingDate).toLocaleDateString('cs-CZ')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Publikace</p>
                  <p className="font-semibold">{new Date(report.publicationDate).toLocaleDateString('cs-CZ')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dokončení</p>
                  <p className="font-semibold">{new Date(report.completionDate).toLocaleDateString('cs-CZ')}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vyplaceno</p>
                  <p className="font-semibold">{report.paymentDate ? new Date(report.paymentDate).toLocaleDateString('cs-CZ') : 'Čeká'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Dosah</p>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{(report.totalReach / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-1">{report.postsCount} příspěvků</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Engagement Rate</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{report.engagementRate.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">{(report.totalEngagement / 1000).toFixed(1)}K interakcí</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">ROI</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">+{report.roi}%</p>
            <p className="text-xs text-gray-500 mt-1">Návratnost investice</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">CPM</p>
              <BarChart className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{report.cpm.toFixed(2)} Kč</p>
            <p className="text-xs text-gray-500 mt-1">Cena za 1000 zobrazení</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Engagement Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Rozložení interakcí
            </h2>

            <div className="space-y-4">
              {engagementBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-semibold">{item.value.toLocaleString('cs-CZ')}</span>
                  </div>
                  <Progress
                    value={(item.value / report.totalEngagement) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {((item.value / report.totalEngagement) * 100).toFixed(1)}% z celkového engagementu
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Finanční přehled
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-600">Celková investice</span>
                <span className="font-semibold text-lg">{report.totalCost.toLocaleString('cs-CZ')} Kč</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-600">Odhadovaný přínos</span>
                <span className="font-semibold text-lg text-green-600">
                  {report.estimatedRevenue?.toLocaleString('cs-CZ')} Kč
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-600">Čistý zisk</span>
                <span className="font-semibold text-lg text-green-600">
                  +{((report.estimatedRevenue || 0) - report.totalCost).toLocaleString('cs-CZ')} Kč
                </span>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">ROI (Return on Investment)</span>
                  <span className="text-2xl font-bold text-green-600">+{report.roi}%</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Výpočet: (Přínos - Náklady) / Náklady × 100%
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">CPM (Cost per Mille)</span>
                  <span className="text-xl font-bold text-blue-600">{report.cpm.toFixed(2)} Kč</span>
                </div>
                <p className="text-xs text-gray-600">
                  Cena za oslovení 1 000 lidí
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Shrnutí výkonu</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Celkový dosah</p>
              <p className="text-2xl font-bold text-blue-600">{(report.totalReach / 1000).toFixed(1)}K</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-600">
                Průměr {(report.totalReach / report.postsCount / 1000).toFixed(1)}K na příspěvek
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Celkové zobrazení</p>
              <p className="text-2xl font-bold text-purple-600">{(report.totalImpressions / 1000).toFixed(1)}K</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-600">
                Průměr {(report.totalImpressions / report.postsCount / 1000).toFixed(1)}K na příspěvek
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
              <p className="text-2xl font-bold text-green-600">{report.engagementRate.toFixed(2)}%</p>
              <Separator className="my-2" />
              <p className="text-xs text-gray-600">
                {report.totalEngagement.toLocaleString('cs-CZ')} celkových interakcí
              </p>
            </div>
          </div>
        </Card>

        {/* Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Poznámka:</strong> Tento report byl automaticky vygenerován po dokončení spolupráce.
            Všechny metriky jsou získány z oficiálních analytických nástrojů sociálních sítí.
            Pro detailní audit a ověření dat kontaktujte tým Collabio.
          </p>
        </div>
      </div>
    </div>
  );
}
