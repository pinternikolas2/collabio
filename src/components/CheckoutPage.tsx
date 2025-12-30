import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CreditCard, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { projectApi } from '../utils/api';
import { calculateServiceFee, getFeePercentage } from '../utils/fees';
import type { Project } from '../types';
import { toast } from 'sonner';

type CheckoutPageProps = {
    projectId: string;
    onNavigate: (page: string, data?: any) => void;
};

export default function CheckoutPage({ projectId, onNavigate }: CheckoutPageProps) {
    const { t } = useTranslation();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

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
            onNavigate('marketplace');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!project || !project.price) return;

        setProcessing(true);
        try {
            // TODO: Integrate with Stripe
            // For now, simulate payment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create collaboration
            // const collaboration = await collaborationApi.create({...});

            toast.success('Platba proběhla úspěšně!');

            // Redirect to collaboration setup
            onNavigate('collaboration-setup', {
                collaborationId: 'temp-collab-id', // Replace with actual ID
                projectId: project.id
            });
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error('Chyba při platbě: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!project || !project.price) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">Projekt nenalezen</p>
                        <Button onClick={() => onNavigate('marketplace')} className="mt-4">
                            Zpět na marketplace
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const serviceFee = calculateServiceFee(project.price);
    const feePercentage = getFeePercentage(project.price);
    const totalAmount = project.price;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => onNavigate('project-detail', { projectId: project.id })}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zpět na projekt
                    </Button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
                        Pokladna
                    </h1>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Order Summary */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Project Info */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Shrnutí objednávky</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    {project.images && project.images[0] && (
                                        <img
                                            src={project.images[0]}
                                            alt={project.title}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                        {project.deliveryTimeDays && (
                                            <div className="mt-2">
                                                <Badge variant="secondary">
                                                    Dodání za {project.deliveryTimeDays} dní
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Způsob platby</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium">Platební karta</p>
                                        <p className="text-sm text-gray-600">Bezpečná platba přes Stripe</p>
                                    </div>
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                                    <p className="font-medium">🔒 Escrow ochrana</p>
                                    <p className="text-xs mt-1">
                                        Peníze budou uvolněny talentu až po dokončení a schválení práce
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Price Breakdown */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Rozpis ceny</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Cena služby</span>
                                        <span className="font-medium">{project.price.toLocaleString('cs-CZ')} Kč</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Servisní poplatek ({feePercentage}%)
                                        </span>
                                        <span className="font-medium">{serviceFee.toLocaleString('cs-CZ')} Kč</span>
                                    </div>
                                    {project.vat && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">DPH ({project.vat}%)</span>
                                            <span className="font-medium">
                                                {((project.price * project.vat) / 100).toLocaleString('cs-CZ')} Kč
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-lg">Celkem</span>
                                    <span className="font-bold text-2xl text-blue-600">
                                        {totalAmount.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 h-12 text-lg"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Zpracování...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Zaplatit {totalAmount.toLocaleString('cs-CZ')} Kč
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    Kliknutím souhlasíte s{' '}
                                    <a href="/?page=terms" className="text-blue-600 hover:underline">
                                        obchodními podmínkami
                                    </a>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
