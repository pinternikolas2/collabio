import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, Clock, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project, User } from '../types';

type QuickBuyCardProps = {
    project: Project;
    owner?: User;
    onBuyNow: (projectId: string) => void;
    onViewDetail: (projectId: string) => void;
};

export default function QuickBuyCard({ project, owner, onBuyNow, onViewDetail }: QuickBuyCardProps) {
    const { t } = useTranslation();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: project.currency || 'CZK',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-orange-100 overflow-hidden">
                {project.images && project.images.length > 0 ? (
                    <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-16 h-16 text-blue-600 opacity-20" />
                    </div>
                )}

                {/* Quick Buy Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0">
                        <Zap className="w-3 h-3 mr-1" />
                        Bleskový nákup
                    </Badge>
                </div>

                {/* Featured Badge */}
                {project.featured && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-5">
                {/* Owner Info */}
                {owner && (
                    <div className="flex items-center gap-2 mb-3">
                        <img
                            src={owner.profileImage || '/default-avatar.png'}
                            alt={owner.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {owner.firstName} {owner.lastName}
                            </p>
                            {owner.verified && (
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-[8px]">✓</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Ověřeno</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Title */}
                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                </p>

                {/* Delivery Time & Rating */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    {project.deliveryTimeDays && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{project.deliveryTimeDays} dní</span>
                        </div>
                    )}
                    {project.rating && project.ratingCount && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{project.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({project.ratingCount})</span>
                        </div>
                    )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Cena</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                            {project.price ? formatPrice(project.price) : 'Dohodou'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail(project.id)}
                        >
                            Detail
                        </Button>
                        <Button
                            onClick={() => onBuyNow(project.id)}
                            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                        >
                            Koupit nyní
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
