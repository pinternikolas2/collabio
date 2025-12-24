import React from 'react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home } from 'lucide-react';

interface NotFoundProps {
    onNavigate: (page: string) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Stránka nenalezena</h2>
                <p className="text-gray-600 mb-8">
                    Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
                </p>
                <Button
                    onClick={() => onNavigate('landing')}
                    className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white min-w-[200px]"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Zpět na úvod
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
