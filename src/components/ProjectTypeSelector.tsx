import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, Target, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProjectType, PaymentType } from '../types';

type ProjectTypeSelectorProps = {
  selectedType: ProjectType;
  selectedPaymentType: PaymentType;
  onTypeChange: (type: ProjectType) => void;
  onPaymentTypeChange: (paymentType: PaymentType) => void;
};

export default function ProjectTypeSelector({
  selectedType,
  selectedPaymentType,
  onTypeChange,
  onPaymentTypeChange,
}: ProjectTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Project Type Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Typ projektu</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Direct Buy */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'direct'
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:border-blue-300'
            }`}
            onClick={() => onTypeChange('direct')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Bleskový nákup</h4>
                    <Badge variant="secondary">Rychlé</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Nabídněte hotovou službu s pevnou cenou a dobou dodání. Firma koupí okamžitě bez vyjednávání.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <div>✓ Pevná cena</div>
                    <div>✓ Okamžitý nákup</div>
                    <div>✓ Jasná doba dodání</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Negotiable Project */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedType === 'negotiable'
                ? 'ring-2 ring-blue-600 bg-blue-50'
                : 'hover:border-blue-300'
            }`}
            onClick={() => onTypeChange('negotiable')}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Projekt k jednání</h4>
                    <Badge variant="outline">Klasické</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Klasický projekt, kde firma pošle nabídku a vy se domluvíte na podmínkách.
                  </p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    <div>✓ Vyjednávání podmínek</div>
                    <div>✓ Flexibilní cena</div>
                    <div>✓ Individuální dohoda</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Type Selection (only for negotiable) */}
      {selectedType === 'negotiable' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Typ platby</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* One-time Payment */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedPaymentType === 'one-time'
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => onPaymentTypeChange('one-time')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1×</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Jednorázová platba</h4>
                    <p className="text-sm text-gray-600">
                      Celá částka se uvolní po dokončení projektu.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones Payment */}
            <Card
              className={`cursor-pointer transition-all ${
                selectedPaymentType === 'milestones'
                  ? 'ring-2 ring-blue-600 bg-blue-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => onPaymentTypeChange('milestones')}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Platba po milnících</h4>
                    <p className="text-sm text-gray-600">
                      Rozdělte projekt na etapy s postupným uvolňováním plateb.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">
              {selectedType === 'direct' ? 'Tip pro bleskové nabídky:' : 'Tip pro projekty:'}
            </p>
            <p className="text-gray-600">
              {selectedType === 'direct'
                ? 'Nabídněte konkrétní službu (např. "Vytvořím 3 Instagram posty s vaším produktem"). Jasná nabídka = více prodejů!'
                : selectedPaymentType === 'milestones'
                ? 'Milníky jsou ideální pro větší projekty. Firma vidí průběžný pokrok a vy dostáváte platby postupně.'
                : 'Jednorázová platba je nejjednodušší varianta pro menší projekty s jasným výstupem.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
