import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useTranslation } from 'react-i18next';
import type { Milestone } from '../types';

type MilestoneManagerProps = {
    milestones: Milestone[];
    totalPrice: number;
    onChange: (milestones: Milestone[]) => void;
};

export default function MilestoneManager({ milestones, totalPrice, onChange }: MilestoneManagerProps) {
    const { t } = useTranslation();
    const [errors, setErrors] = useState<string[]>([]);

    const addMilestone = () => {
        if (milestones.length >= 10) {
            setErrors(['Maximálně 10 milníků']);
            return;
        }

        const newMilestone: Milestone = {
            id: `milestone-${Date.now()}`,
            title: '',
            price: 0,
            status: 'pending',
            order: milestones.length,
        };

        onChange([...milestones, newMilestone]);
        setErrors([]);
    };

    const removeMilestone = (index: number) => {
        const updated = milestones.filter((_, i) => i !== index);
        // Reorder
        const reordered = updated.map((m, i) => ({ ...m, order: i }));
        onChange(reordered);
    };

    const updateMilestone = (index: number, field: 'title' | 'price', value: string | number) => {
        const updated = [...milestones];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
        validateMilestones(updated);
    };

    const validateMilestones = (mls: Milestone[]) => {
        const newErrors: string[] = [];

        // Check if all have titles
        if (mls.some(m => !m.title.trim())) {
            newErrors.push('Všechny milníky musí mít název');
        }

        // Check if all have prices > 0
        if (mls.some(m => m.price <= 0)) {
            newErrors.push('Všechny milníky musí mít cenu větší než 0');
        }

        // Check if sum equals total
        const sum = mls.reduce((acc, m) => acc + Number(m.price), 0);
        if (Math.abs(sum - totalPrice) > 0.01) {
            newErrors.push(`Součet milníků (${sum} Kč) se neshoduje s celkovou cenou (${totalPrice} Kč)`);
        }

        setErrors(newErrors);
    };

    const milestonesSum = milestones.reduce((acc, m) => acc + Number(m.price), 0);
    const isValid = errors.length === 0 && milestonesSum === totalPrice;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{t('milestones.title')}</h3>
                        <p className="text-sm text-gray-500">
                            Rozdělte projekt na jednotlivé milníky s postupným uvolňováním plateb
                        </p>
                    </div>
                    <Badge variant={isValid ? 'default' : 'destructive'}>
                        {milestonesSum} / {totalPrice} Kč
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Errors */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                        {errors.map((error, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Milestones List */}
                <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <Label htmlFor={`milestone-title-${index}`}>Název milníku</Label>
                                    <Input
                                        id={`milestone-title-${index}`}
                                        value={milestone.title}
                                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                        placeholder="např. Návrh konceptu, Finální realizace..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`milestone-price-${index}`}>Částka (Kč)</Label>
                                    <Input
                                        id={`milestone-price-${index}`}
                                        type="number"
                                        value={milestone.price}
                                        onChange={(e) => updateMilestone(index, 'price', Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMilestone(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                {milestones.length < 10 && (
                    <Button
                        variant="outline"
                        onClick={addMilestone}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('milestones.add')}
                    </Button>
                )}

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                    <p className="font-medium">💡 Jak fungují milníky?</p>
                    <ul className="mt-2 space-y-1 text-xs">
                        <li>• Celá částka se zaplatí předem do escrow</li>
                        <li>• Po dokončení každého milníku se uvolní odpovídající částka</li>
                        <li>• Firma musí schválit dokončení každého milníku</li>
                        <li>• Součet všech milníků musí být roven celkové ceně</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
