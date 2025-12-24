import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface ForgotPasswordProps {
    onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
            toast.success('Email pro obnovu hesla byl odeslán');
        } catch (err: any) {
            setError(err.message || 'Nepodařilo se odeslat email pro obnovu hesla');
            toast.error('Chyba při odesílání emailu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigate('auth')}
                            className="pl-0 text-gray-600 hover:text-blue-600"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Zpět na přihlášení
                        </Button>
                    </div>
                    <CardTitle className="text-center text-2xl">Zapomenuté heslo</CardTitle>
                    <CardDescription className="text-center">
                        Zadejte svůj email a my vám pošleme instrukce pro obnovu hesla.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                                <p>Odkaz pro obnovu hesla byl odeslán na adresu <strong>{email}</strong>.</p>
                                <p className="text-sm mt-2">Zkontrolujte prosím svou emailovou schránku (případně složku Spam).</p>
                            </div>
                            <Button onClick={() => onNavigate('auth')} className="w-full">
                                Zpět na přihlášení
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="vas@email.cz"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Odesílám...
                                    </>
                                ) : (
                                    'Odeslat instrukce'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
