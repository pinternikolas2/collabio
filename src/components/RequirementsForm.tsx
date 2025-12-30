import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type RequirementsFormProps = {
    requirements: string[];
    onSubmit: (data: Record<string, string>) => void;
    isSubmitting?: boolean;
};

export default function RequirementsForm({ requirements, onSubmit, isSubmitting }: RequirementsFormProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields are filled
        const newErrors: string[] = [];
        requirements.forEach((req, index) => {
            if (!formData[`req-${index}`]?.trim()) {
                newErrors.push(`Vyplňte: ${req}`);
            }
        });

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);
        onSubmit(formData);
    };

    const updateField = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [`req-${index}`]: value,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold">Požadované podklady</h3>
                <p className="text-sm text-gray-500">
                    Vyplňte následující informace, které talent potřebuje pro zahájení práce
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* Fields */}
                    {requirements.map((requirement, index) => {
                        const isLongText = requirement.toLowerCase().includes('popis') ||
                            requirement.toLowerCase().includes('detail') ||
                            requirement.length > 50;

                        return (
                            <div key={index}>
                                <Label htmlFor={`req-${index}`}>
                                    {index + 1}. {requirement}
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                {isLongText ? (
                                    <Textarea
                                        id={`req-${index}`}
                                        value={formData[`req-${index}`] || ''}
                                        onChange={(e) => updateField(index, e.target.value)}
                                        placeholder={`Zadejte ${requirement.toLowerCase()}...`}
                                        rows={4}
                                        required
                                    />
                                ) : (
                                    <Input
                                        id={`req-${index}`}
                                        value={formData[`req-${index}`] || ''}
                                        onChange={(e) => updateField(index, e.target.value)}
                                        placeholder={`Zadejte ${requirement.toLowerCase()}...`}
                                        required
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Submit */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                        >
                            {isSubmitting ? 'Odesílání...' : 'Odeslat a zahájit spolupráci'}
                        </Button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        <p className="font-medium">ℹ️ Co se stane po odeslání?</p>
                        <ul className="mt-2 space-y-1 text-xs">
                            <li>• Talent obdrží notifikaci a začne pracovat</li>
                            <li>• Peníze jsou v bezpečí v escrow systému</li>
                            <li>• Budete informováni o průběhu práce</li>
                        </ul>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
