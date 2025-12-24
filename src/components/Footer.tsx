import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type FooterProps = {
  onNavigate: (page: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const { t } = useTranslation();
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white mt-20 overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* O platformě */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="Collabio Logo" className="w-10 h-10 rounded-xl" />
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {t('footer.about')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Rychlé odkazy */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.links_about')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.links_marketplace')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('talents')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.links_talents')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.links_companies')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="text-gray-300 hover:text-white transition-colors">
                  {t('navigation.events')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.links_faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Právní informace */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('terms')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.legal_terms')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gdpr')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.legal_gdpr')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cookies')} className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.legal_cookies')}
                </button>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Collabio s.r.o.<br />
                  Praha 1, Wenceslas Square 1<br />
                  110 00 Praha<br />
                  IČO: 12345678
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:info@collabio.cz" className="text-gray-300 hover:text-white transition-colors">
                  info@collabio.cz
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+420222111000" className="text-gray-300 hover:text-white transition-colors">
                  +420 222 111 000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Collabio s.r.o. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
