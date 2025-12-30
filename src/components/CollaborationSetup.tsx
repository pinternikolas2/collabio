import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import RequirementsForm from './RequirementsForm';
import { projectApi, collaborationApi } from '../utils/api';
import type { Project, Collaboration } from '../types';
import { toast } from 'sonner';

type CollaborationSetupProps = {
    collaborationId: string;
    projectId: string;
    onNavigate: (page: string, data?: any) => void;
};

export default function CollaborationSetup({
    collaborationId,
    projectId,
    onNavigate,
}: CollaborationSetupProps) {
    const { t } = useTranslation();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const data = await projectApi.getProject(projectId);
            setProject(data);
        } catch (error) {
            console.error('Error loading project:', error);
            toast.error('Nepodařilo se načíst projekt');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (requirementsData: Record<string, string>) => {
        setSubmitting(true);
        try {
            // Update collaboration with requirements data
            await collaborationApi.updateCollaboration(collaborationId, {
                requirementsData,
                status: 'in_progress',
            });

            setSubmitted(true);
            toast.success('Požadavky byly odeslány!');

            // Redirect after 2 seconds
            setTimeout(() => {
                onNavigate('collaborations');
            }, 2000);
        } catch (error: any) {
            console.error('Error submitting requirements:', error);
            toast.error('Chyba při odesílání: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!project || !project.requirements || project.requirements.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">Projekt nevyžaduje žádné podklady</p>
                        <Button onClick={() => onNavigate('collaborations')} className="mt-4">
                            Přejít na spolupráce
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Hotovo!</h2>
                        <p className="text-gray-600 mb-4">
                            Požadavky byly odeslány talentu. Spolupráce byla zahájena.
                        </p>
                        <p className="text-sm text-gray-500">
                            Přesměrování na přehled spoluprací...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📋</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent mb-2">
                        Nastavení spolupráce
                    </h1>
                    <p className="text-gray-600">
                        Poslední krok před zahájením práce
                    </p>
                </div>

                {/* Project Info */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            {project.images && project.images[0] && (
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{project.title}</h3>
                                <p className="text-sm text-gray-600">
                                    Platba byla úspěšně provedena a je uložena v escrow systému
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Zaplaceno</p>
                                <p className="text-xl font-bold text-green-600">
                                    {project.price?.toLocaleString('cs-CZ')} Kč
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements Form */}
                <RequirementsForm
                    requirements={project.requirements}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />

                {/* Help */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Potřebujete pomoc?{' '}
                        <a href="/?page=contact" className="text-blue-600 hover:underline">
                            Kontaktujte podporu
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
