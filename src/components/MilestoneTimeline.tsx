import { CheckCircle, Circle, Clock, Upload } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from 'react-i18next';
import type { Milestone } from '../types';

type MilestoneTimelineProps = {
    milestones: Milestone[];
    currentMilestoneIndex: number;
    userRole: 'talent' | 'company';
    onUploadEvidence?: (milestoneIndex: number) => void;
    onApproveMilestone?: (milestoneIndex: number) => void;
};

export default function MilestoneTimeline({
    milestones,
    currentMilestoneIndex,
    userRole,
    onUploadEvidence,
    onApproveMilestone,
}: MilestoneTimelineProps) {
    const { t } = useTranslation();

    const getStatusColor = (status: Milestone['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-600';
            case 'completed':
                return 'bg-blue-600';
            case 'in_progress':
                return 'bg-orange-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getStatusIcon = (status: Milestone['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-white" />;
            case 'completed':
            case 'in_progress':
                return <Clock className="w-5 h-5 text-white" />;
            default:
                return <Circle className="w-5 h-5 text-white" />;
        }
    };

    const getStatusText = (status: Milestone['status']) => {
        switch (status) {
            case 'approved':
                return 'Schváleno';
            case 'completed':
                return 'Dokončeno';
            case 'in_progress':
                return 'Probíhá';
            default:
                return 'Čeká';
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Milníky projektu</h3>

                <div className="space-y-6">
                    {milestones.map((milestone, index) => {
                        const isActive = index === currentMilestoneIndex;
                        const isPast = index < currentMilestoneIndex;
                        const isFuture = index > currentMilestoneIndex;

                        return (
                            <div key={milestone.id} className="relative">
                                {/* Connector Line */}
                                {index < milestones.length - 1 && (
                                    <div
                                        className={`absolute left-5 top-12 w-0.5 h-full ${isPast ? 'bg-green-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}

                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                                                milestone.status
                                            )} ${isActive ? 'ring-4 ring-blue-200' : ''}`}
                                        >
                                            {getStatusIcon(milestone.status)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold">{milestone.title}</h4>
                                                        <Badge
                                                            variant={
                                                                milestone.status === 'approved'
                                                                    ? 'default'
                                                                    : milestone.status === 'completed'
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                            }
                                                        >
                                                            {getStatusText(milestone.status)}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Milník {index + 1} z {milestones.length}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {milestone.price.toLocaleString('cs-CZ')} Kč
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {isActive && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    {userRole === 'talent' && milestone.status === 'in_progress' && (
                                                        <Button
                                                            onClick={() => onUploadEvidence?.(index)}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Nahrát důkaz dokončení
                                                        </Button>
                                                    )}
                                                    {userRole === 'company' && milestone.status === 'completed' && (
                                                        <Button
                                                            onClick={() => onApproveMilestone?.(index)}
                                                            className="w-full bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Schválit a uvolnit platbu
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Celkový pokrok</p>
                            <p className="text-lg font-semibold">
                                {milestones.filter(m => m.status === 'approved').length} / {milestones.length} dokončeno
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Celková částka</p>
                            <p className="text-lg font-semibold text-blue-600">
                                {milestones.reduce((sum, m) => sum + m.price, 0).toLocaleString('cs-CZ')} Kč
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
