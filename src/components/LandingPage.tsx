import React from 'react';
import { ArrowRight, Users, Shield, Zap, TrendingUp, Star, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import SEO from './SEO';

type LandingPageProps = {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
};

export default function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  const { t } = useTranslation();

  const features = [
    {
      icon: TrendingUp,
      title: t('landing.features.marketing_title'),
      description: t('landing.features.marketing_desc'),
    },
    {
      icon: Shield,
      title: t('landing.features.security_title'),
      description: t('landing.features.security_desc'),
    },
    {
      icon: CheckCircle,
      title: t('landing.features.legal_title'),
      description: t('landing.features.legal_desc'),
    },
    {
      icon: Star,
      title: t('landing.features.transparency_title'),
      description: t('landing.features.transparency_desc'),
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('landing.how_it_works.step1_title'),
      description: t('landing.how_it_works.step1_desc'),
    },
    {
      number: '2',
      title: t('landing.how_it_works.step2_title'),
      description: t('landing.how_it_works.step2_desc'),
    },
    {
      number: '3',
      title: t('landing.how_it_works.step3_title'),
      description: t('landing.how_it_works.step3_desc'),
    },
    {
      number: '4',
      title: t('landing.how_it_works.step4_title'),
      description: t('landing.how_it_works.step4_desc'),
    },
  ];

  const benefits = {
    talents: (t('landing.benefits.talent_list', { returnObjects: true }) as string[]),
    companies: (t('landing.benefits.company_list', { returnObjects: true }) as string[]),
  };

  const rawFaqs = t('landing.faq.items', { returnObjects: true });
  const faqs = (Array.isArray(rawFaqs) ? rawFaqs : []).map((item: any) => ({
    question: item.q,
    answer: item.a
  }));

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO
        title={t('landing.hero.title')}
        description={t('landing.hero.subtitle')}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djRoNHYtNGgtNHptMCA4djRoNHYtNGgtNHptLTQgMHYtNGgtNHY0aDR6bTAgNHY0aDR2LTRoLTR6bS00IDB2LTRoLTR2NGg0em0tOCAwdi00aC00djRoNHptMCA0djRoNHYtNGgtNHptOCAwdjRoNHYtNGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto px-4 py-20 relative z-10 max-w-full">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {t('landing.hero.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8"
                onClick={() => onNavigate(isLoggedIn ? 'marketplace' : 'register')}
              >
                {isLoggedIn ? t('landing.hero.btn_explore') : t('landing.hero.btn_start')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.how_it_works.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.how_it_works.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.benefits.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.benefits.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Pro talenty */}
            <Card className="border-2 border-blue-200 hover:border-blue-500 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold">{t('landing.benefits.for_talents')}</h3>
                </div>
                <ul className="space-y-3">
                  {benefits.talents.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  onClick={() => onNavigate('register')}
                >
                  {t('landing.benefits.btn_talent')}
                </Button>
              </CardContent>
            </Card>

            {/* Pro firmy */}
            <Card className="border-2 border-orange-200 hover:border-orange-500 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold">{t('landing.benefits.for_companies')}</h3>
                </div>
                <ul className="space-y-3">
                  {benefits.companies.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                  onClick={() => onNavigate('register')}
                >
                  {t('landing.benefits.btn_company')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-orange-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-md bg-white/90 backdrop-blur-sm group"
              >
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`item-${index}`} className="border-0">
                      <AccordionTrigger className="text-left px-6 py-4 hover:no-underline group-hover:text-blue-600 transition-colors">
                        <div className="flex items-start gap-3 pr-4">
                          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center mt-0.5 group-hover:from-blue-600 group-hover:to-orange-500 transition-all">
                            <span className="font-bold text-blue-600 text-sm group-hover:text-white">{index + 1}</span>
                          </div>
                          <span className="flex-1 font-semibold">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5 text-gray-600 leading-relaxed">
                        <div className="pl-10">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 border border-blue-200">
              <p className="text-gray-700">
                {t('landing.faq.more_questions')}
              </p>
              <Button
                onClick={() => onNavigate('faq')}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 shadow-lg"
              >
                {t('landing.faq.view_all')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-600 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8"
              onClick={() => onNavigate(isLoggedIn ? 'marketplace' : 'register')}
            >
              {isLoggedIn ? t('landing.hero.btn_explore') : t('landing.hero.btn_start')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border-2 border-white text-white hover:bg-white/10 hover:text-white text-lg px-8"
              onClick={() => onNavigate('contact')}
            >
              {t('landing.cta.contact_us')}
            </Button>
          </div>
        </div>
      </section>

      {/* Warning for non-registered */}
      {!isLoggedIn && (
        <section className="py-12 bg-yellow-50 border-t-4 border-yellow-400">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-semibold mb-3 text-yellow-900">
                {t('landing.warning.title')}
              </h3>
              <p className="text-yellow-800 mb-4">
                {t('landing.warning.desc')}
              </p>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => onNavigate('register')}
              >
                {t('landing.warning.btn')}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
