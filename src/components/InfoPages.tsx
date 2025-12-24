import { Mail, Phone, MapPin, Shield, FileText, Cookie, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type InfoPageProps = {
  onNavigate: (page: string) => void;
};

export function AboutPage({ onNavigate }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
          O platformě Collabio
        </h1>

        <Card className="mb-8">
          <CardContent className="p-8 prose max-w-none">
            <h2>Kdo jsme</h2>
            <p>
              Collabio je moderní platforma, která propojuje talenty (sportovce, umělce, influencery) s firmami a sponzory.
              Naším cílem je vytvořit bezpečné a transparentní prostředí pro úspěšné spolupráce.
            </p>

            <h2>Naše mise</h2>
            <p>
              Věříme, že každý talent si zaslouží férové podmínky a bezpečné platby. Proto jsme vyvinuli komplexní systém
              s escrow platbami, automatickými smlouvami a transparentním hodnocením.
            </p>

            <h2>Co nabízíme</h2>
            <ul>
              <li><strong>Bezpečné platby:</strong> Escrow systém zajistí, že peníze jsou uvolněny až po dokončení spolupráce</li>
              <li><strong>Ověřené profily:</strong> Všichni uživatelé procházejí ověřením</li>
              <li><strong>Automatické smlouvy:</strong> Generujeme profesionální smlouvy s digitálním podpisem</li>
              <li><strong>Transparentní hodnocení:</strong> Systém recenzí pomáhá budovat důvěru</li>
              <li><strong>Real-time komunikace:</strong> Chat a notifikace v reálném čase</li>
            </ul>

            <h2>Proč Collabio?</h2>
            <p>
              Na rozdíl od tradičních platforem se zaměřujeme výhradně na kvalitní spolupráce. Náš tým má zkušenosti
              s influencer marketingem a ví, co talenty i firmy potřebují.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => onNavigate('contact')}
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
          >
            Kontaktujte nás
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ContactPage({ onNavigate }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
          Kontakt
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Kontaktní informace</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Adresa</p>
                  <p className="text-gray-600">
                    Collabio s.r.o.<br />
                    Wenceslas Square 1<br />
                    110 00 Praha 1<br />
                    IČO: 12345678
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:info@collabio.cz" className="text-blue-600 hover:underline">
                    info@collabio.cz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Telefon</p>
                  <a href="tel:+420222111000" className="text-blue-600 hover:underline">
                    +420 222 111 000
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Napište nám</h3>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Jméno</Label>
                  <Input id="name" placeholder="Vaše jméno" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="vas@email.cz" />
                </div>
                <div>
                  <Label htmlFor="message">Zpráva</Label>
                  <Textarea id="message" placeholder="Vaše zpráva..." rows={4} />
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                  Odeslat zprávu
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function FAQPage({ onNavigate }: InfoPageProps) {
  const faqs = [
    {
      question: 'Co je Collabio?',
      answer: 'Collabio je moderní platforma, která propojuje firmy a sponzory s talentovanými sportovci, umělci a influencery. Umožňuje rychle a bezpečně domlouvat spolupráce a sponzorství.',
    },
    {
      question: 'Jak funguje proces spolupráce?',
      answer: 'Firmy i talenti si nastaví své profily a projekty. Po nalezení vhodného partnera se domluví spolupráce přímo přes Collabio, která je chráněna escrow platbou – peníze jsou uvolněny až po dokončení dohody.',
    },
    {
      question: 'Je používání Collabio bezpečné?',
      answer: 'Ano. Celý proces domluvy a platby je zabezpečen. Vaše osobní údaje jsou chráněny podle GDPR a komunikace probíhá v šifrovaném prostředí.',
    },
    {
      question: 'Jak platby a escrow fungují?',
      answer: 'Platba je uložena bezpečně přes Stripe a uvolněna talentovi až po splnění domluvené práce. Tak získají firmy jistotu, že podmínky budou dodrženy, a talent bezpečně dostane své peníze.',
    },
    {
      question: 'Mohu si zvolit typ spolupráce?',
      answer: 'Ano. Můžete nabídnout malé rychlé spolupráce (např. jedno story, krátký výkon) s okamžitou platbou, nebo delší projekty s domluvenými termíny a eskrow zabezpečením.',
    },
    {
      question: 'Jak se mohu registrovat a začít?',
      answer: 'Stačí se zaregistrovat, ověřit e-mail, doplnit profil a propojit platební účet (Stripe). Následně můžete vyhledávat partnery, domlouvat spolupráce a spravovat projekty.',
    },
    {
      question: 'Mohu spravovat více projektů najednou?',
      answer: 'Ano. Firmy mají přehledné dashboardy pro všechny projekty, spolupráce, platby a reporty, talenti pak přehled portfolia, domluv a výplat.',
    },
    {
      question: 'Mohu měnit informace na profilu?',
      answer: 'Ano, svůj profil můžete kdykoliv aktualizovat – včetně portfolia, sociálních sítí a kontaktních údajů. Vaše údaje jsou chráněny a viditelné jen registrovaným partnerům podle nastavení.',
    },
    {
      question: 'Jaké typy talentů a projektů mohu najít?',
      answer: 'Na Collabio najdete sportovce, influencery, umělce a pořadatele akcí. Firmy mohou hledat vhodné talenty pro marketing, sponzorství nebo propagaci svých projektů.',
    },
    {
      question: 'Co když dojde ke sporu mezi firmou a talentem?',
      answer: 'Collabio má systém nahlášení a administrátorský dohled. Navíc escrow platba zajišťuje, že peníze jsou uvolněny až po splnění domluvených podmínek, což minimalizuje riziko sporu.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Často kladené otázky
          </h1>
          <p className="text-gray-600">
            Najděte odpovědi na nejčastější otázky o platformě Collabio
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-3">Nenašli jste odpověď?</h3>
            <p className="text-gray-700 mb-4">
              Náš tým podpory je tu pro vás 24/7
            </p>
            <Button
              onClick={() => onNavigate('contact')}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Kontaktovat podporu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TermsPage({ onNavigate: _ }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Všeobecné obchodní podmínky
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 prose max-w-none">
            <p className="text-sm text-gray-500 mb-6 font-mono border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
              <strong>Verze dokumentu:</strong> 1.0<br />
              <strong>Datum účinnosti:</strong> 20. října 2025<br />
              <strong>Provozovatel:</strong> Collabio s.r.o.
            </p>

            <div className="space-y-8">
              <section>
                <h2>1. Úvodní ustanovení</h2>
                <p>
                  <strong>1.1.</strong> Tyto Všeobecné obchodní podmínky (dále jen „<strong>VOP</strong>“) upravují práva a povinnosti při užívání online platformy <strong>Collabio</strong> (dále jen „<strong>Platforma</strong>“), provozované společností Collabio s.r.o., se sídlem Wenceslas Square 1, 110 00 Praha 1, IČ: 12345678 (dále jen „<strong>Provozovatel</strong>“).
                </p>
                <p>
                  <strong>1.2.</strong> Platforma slouží jako digitální tržiště propojující subjekty poptávající reklamní či marketingové služby (dále jen „<strong>Firma</strong>“) s poskytovateli těchto služeb, zejména influencery, sportovci a umělci (dále jen „<strong>Talent</strong>“). Firma a Talent jsou společně označováni jako „<strong>Uživatelé</strong>“.
                </p>
                <p>
                  <strong>1.3.</strong> Registrací na Platformě Uživatel stvrzuje, že se seznámil s těmito VOP a bezvýhradně s nimi souhlasí.
                </p>
              </section>

              <section>
                <h2>2. Uživatelský účet a registrace</h2>
                <p>
                  <strong>2.1.</strong> Užívání Platformy je podmíněno registrací. Uživatel je povinen uvádět při registraci pouze pravdivé a aktuální údaje.
                </p>
                <p>
                  <strong>2.2.</strong> Uživatel nese plnou odpovědnost za zabezpečení svých přihlašovacích údajů. Provozovatel nenese odpovědnost za zneužití účtu třetí osobou v důsledku nedbalosti Uživatele.
                </p>
                <p>
                  <strong>2.3.</strong> Provozovatel si vyhrazuje právo odmítnout registraci nebo zrušit účet Uživatele, který porušuje tyto VOP nebo dobré mravy.
                </p>
              </section>

              <section>
                <h2>3. Pravidla pro uzavírání spolupráce (Marketplace)</h2>
                <p>
                  <strong>3.1.</strong> Platforma umožňuje Firmám zveřejňovat poptávky (Projekty) a Talentům na ně reagovat, případně Firmám přímo oslovovat Talenty.
                </p>
                <p>
                  <strong>3.2.</strong> K uzavření závazné dohody o spolupráci (dále jen „<strong>Kontrakt</strong>“) dochází v okamžiku, kdy obě strany potvrdí podmínky spolupráce (cena, rozsah, termín) prostřednictvím rozhraní Platformy.
                </p>
                <p>
                  <strong>3.3.</strong> <strong>Zákaz obcházení Platformy:</strong> Uživatelé se zavazují, že nebudou obcházet Platformu za účelem vyhnutí se poplatkům Provozovatele. Pokud dojde ke kontaktu na Platformě, následná transakce musí proběhnout přes Platformu. Porušení tohoto bodu podléhá smluvní pokutě ve výši 50 000 Kč a zablokování účtu.
                </p>
              </section>

              <section>
                <h2>4. Platební podmínky a Escrow</h2>
                <p>
                  <strong>4.1.</strong> Pro zajištění bezpečnosti transakcí využívá Platforma systém tzv. „Escrow“ plateb (úschova peněz), technicky zajištěný společností Stripe Payments Europe, Ltd.
                </p>
                <p>
                  <strong>4.2.</strong> Postup platby:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Po uzavření Kontraktu složí Firma dohodnutou částku do úschovy (Escrow).</li>
                  <li>Talent realizuje sjednané plnění (např. zveřejní příspěvek).</li>
                  <li>Po potvrzení splnění Firmou (nebo marným uplynutím lhůty pro reklamaci) jsou prostředky uvolněny na účet Talenta.</li>
                </ul>
                <p>
                  <strong>4.3. Servisní poplatek:</strong> Provozovatel si účtuje servisní poplatek (Provize) za zprostředkování, právní zajištění a správu Escrow systému. Výše provize je vypočítána z celkové odměny následovně:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4 text-gray-700">
                  <li><strong>20 %</strong> u transakcí v objemu do 20 000 Kč;</li>
                  <li><strong>15 %</strong> u transakcí v objemu od 20 001 Kč do 100 000 Kč;</li>
                  <li><strong>7 %</strong> u transakcí v objemu nad 100 000 Kč.</li>
                </ul>
                <p>
                  Provize je automaticky odečtena z částky držené v úschově před výplatou Talentu a je nevratná.
                </p>
                <p>
                  <strong>4.4.</strong> Uživatelé berou na vědomí, že Provozovatel není poskytovatelem platebních služeb; ty jsou poskytovány třetí stranou (Stripe).
                </p>
              </section>

              <section>
                <h2>5. Práva a povinnosti stran</h2>
                <p>
                  <strong>5.1. Talent prohlašuje, že:</strong> má veškerá práva k obsahu, který vytváří, a jeho plnění neporušuje práva třetích osob ani právní předpisy (včetně pravidel pro označování reklamy).
                </p>
                <p>
                  <strong>5.2. Firma se zavazuje:</strong> poskytnout Talentovi veškerou součinnost a podklady nutné pro realizaci spolupráce a řádně a včas uvolnit platbu po splnění podmínek.
                </p>
                <p>
                  <strong>5.3.</strong> Provozovatel nevstupuje do právního vztahu mezi Firmou a Talentem týkajícího se samotného předmětu díla, pouze poskytuje technické prostředky pro jejich interakci.
                </p>
              </section>

              <section>
                <h2>6. Reklamace a řešení sporů</h2>
                <p>
                  <strong>6.1.</strong> V případě nespokojenosti s plněním má Firma právo „Zadržet platbu“ v systému a zahájit spor.
                </p>
                <p>
                  <strong>6.2.</strong> Provozovatel poskytuje v rámci Platformy "Centrum pro řešení sporů". Ačkoliv Provozovatel není soudce, pokusí se zprostředkovat smírné řešení na základě předložených důkazů (komunikace v chatu, screenshoty).
                </p>
                <p>
                  <strong>6.3.</strong> Pokud nedojde k dohodě, bude platba v Escrow zadržena do rozhodnutí příslušného soudu nebo dohody stran.
                </p>
              </section>

              <section>
                <h2>7. Ochrana duševního vlastnictví</h2>
                <p>
                  <strong>7.1.</strong> Nahráním obsahu na Platformu (portfolio, fotky) uděluje Uživatel Provozovateli nevýhradní, bezúplatnou licenci k užití tohoto obsahu za účelem propagace Platformy a poskytování služeb.
                </p>
              </section>

              <section>
                <h2>8. Závěrečná ustanovení</h2>
                <p>
                  <strong>8.1.</strong> Provozovatel nenese odpovědnost za výpadky Platformy způsobené vyšší mocí nebo údržbou systému.
                </p>
                <p>
                  <strong>8.2.</strong> Vztahy neupravené těmito VOP se řídí právním řádem České republiky, zejména Občanským zákoníkem.
                </p>
                <p>
                  <strong>8.3.</strong> Provozovatel je oprávněn tyto VOP jednostranně měnit. O změně informuje Uživatele s předstihem e-mailem.
                </p>
              </section>

              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Potřebujete právní radu?</h3>
                <p className="text-gray-600 text-sm">
                  Tyto podmínky jsou zjednodušeným právním rámcem pro fungování Platformy. V případě specifických smluvních požadavků doporučujeme konzultaci s advokátem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GDPRPage({ onNavigate: _ }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Zásady ochrany osobních údajů (GDPR)
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 prose max-w-none">
            <p className="text-sm text-gray-500 mb-6 font-mono bg-green-50 p-4 rounded-lg border border-green-200">
              Vaše soukromí bereme vážně. Tento dokument podrobně popisuje, jak nakládáme s vašimi daty v souladu s Nařízením EU 2016/679 (GDPR).
            </p>

            <div className="space-y-8">
              <section>
                <h2>1. Správce údajů</h2>
                <p>
                  Správcem vašich osobních údajů je:<br />
                  <strong>Collabio s.r.o.</strong><br />
                  se sídlem Wenceslas Square 1, 110 00 Praha 1<br />
                  IČ: 12345678<br />
                  zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C, vložka 12345.<br />
                  <strong>Pověřenec pro ochranu osobních údajů (DPO):</strong> dpo@collabio.cz
                </p>
              </section>

              <section>
                <h2>2. Jaké údaje shromažďujeme a proč?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-blue-700 mt-0">Registrační údaje</h3>
                    <p className="text-sm text-gray-600">
                      Jméno, příjmení, e-mail, telefon, IČO (pro firmy).<br />
                      <strong>Účel:</strong> Vytvoření účtu, identifikace smluvní strany.
                    </p>
                  </div>
                  <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-blue-700 mt-0">Profilová data</h3>
                    <p className="text-sm text-gray-600">
                      Biografie, fotografie, odkazy na sociální sítě, portfolio.<br />
                      <strong>Účel:</strong> Prezentace na tržišti za účelem získání zakázek.
                    </p>
                  </div>
                  <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-blue-700 mt-0">Finanční údaje</h3>
                    <p className="text-sm text-gray-600">
                      Číslo bankovního účtu, historie transakcí (čísla karet neukládáme, zpracovává Stripe).<br />
                      <strong>Účel:</strong> Výplata odměn a fakturace.
                    </p>
                  </div>
                  <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <h3 className="font-semibold text-blue-700 mt-0">Technické údaje</h3>
                    <p className="text-sm text-gray-600">
                      IP adresa, cookies, logy o aktivitě.<br />
                      <strong>Účel:</strong> Bezpečnost platformy, prevence podvodů.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2>3. Právní základ zpracování</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Plnění smlouvy:</strong> nezbytné pro fungování Platformy a poskytování sjednaných služeb.</li>
                  <li><strong>Oprávněný zájem:</strong> pro bezpečnost, analytiku a vylepšování služeb.</li>
                  <li><strong>Plnění právních povinností:</strong> účetnictví, daně, AML (praní špinavých peněz).</li>
                  <li><strong>Souhlas:</strong> pro zasílání marketingových newsletterů (lze kdykoliv odvolat).</li>
                </ul>
              </section>

              <section>
                <h2>4. Komu údaje předáváme (Zpracovatelé)</h2>
                <p>Pro zajištění chodu Platformy využíváme ověřené partnery, kteří splňují přísné bezpečnostní standardy:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Partner</th>
                        <th className="border p-2 text-left">Účel</th>
                        <th className="border p-2 text-left">Lokace dat</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2"><strong>Google Cloud (Firebase)</strong></td>
                        <td className="border p-2">Hosting databáze a souborů</td>
                        <td className="border p-2">EU (Irsko/Frankfurt)</td>
                      </tr>
                      <tr>
                        <td className="border p-2"><strong>Stripe</strong></td>
                        <td className="border p-2">Zpracování plateb a KYC</td>
                        <td className="border p-2">USA (s certifikací Data Privacy Framework)</td>
                      </tr>
                      <tr>
                        <td className="border p-2"><strong>Resend/SendGrid</strong></td>
                        <td className="border p-2">Rozesílání transakčních e-mailů</td>
                        <td className="border p-2">USA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2>5. Jak dlouho data uchováváme?</h2>
                <p>
                  Údaje uchováváme po dobu trvání vašeho účtu. Po zrušení účtu jsou data anonymizována nebo smazána do 30 dnů, s výjimkou údajů, které musíme archivovat ze zákona (např. faktury po dobu 10 let).
                </p>
              </section>

              <section>
                <h2>6. Vaše práva</h2>
                <p>Dle GDPR máte právo:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Požadovat přístup k vašim údajům a jejich kopii.</li>
                  <li>Požadovat opravu nebo výmaz údajů („právo být zapomenut“).</li>
                  <li>Omezit zpracování údajů.</li>
                  <li>Vznést námitku proti zpracování.</li>
                  <li>Na přenositelnost údajů (export dat).</li>
                  <li>Podat stížnost u dozorového úřadu (Úřad pro ochranu osobních údajů).</li>
                </ul>
              </section>

              <section>
                <h2>7. Zabezpečení</h2>
                <p>
                  Data jsou přenášena šifrovaným kanálem (HTTPS/TLS 1.3). Databáze jsou chráněny firewally a přístup k nim podléhá přísným bezpečnostním pravidlům (MFA, logování přístupů).
                </p>
              </section>

              <div className="bg-blue-50 p-6 rounded-xl mt-8">
                <h3 className="text-lg font-bold mb-2 text-blue-800">Máte dotaz k ochraně dat?</h3>
                <p className="mb-4 text-blue-900">
                  Pokud máte jakékoliv nejasnosti nebo chcete uplatnit svá práva, kontaktujte našeho pověřence.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="bg-white hover:bg-blue-100" onClick={() => window.location.href = 'mailto:dpo@collabio.cz'}>
                    <Mail className="w-4 h-4 mr-2" />
                    Napsat pověřenci
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CookiesPage({ onNavigate: _ }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-500 bg-clip-text text-transparent">
            Zásady používání souborů Cookies
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 prose max-w-none">
            <p className="text-sm text-gray-500 mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              Abychom vám mohli nabídnout co nejlepší zážitek z používání Collabio, využíváme v souladu se směrnicí ePrivacy soubory cookies.
            </p>

            <div className="space-y-8">
              <section>
                <h2>Co jsou to Cookies?</h2>
                <p>
                  Cookies jsou malé textové soubory, které webová stránka ukládá do vašeho počítače nebo mobilního zařízení v okamžiku, kdy ji začnete využívat. Cookies si na určitou dobu pamatují vaše preference a úkony, které jste na nich provedli (např. přihlášení, jazyk, velikost písma a jiné zobrazovací preference).
                </p>
              </section>

              <section>
                <h2>Jaké typy Cookies používáme?</h2>

                <div className="mt-4 space-y-4">
                  <div className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h3 className="font-bold text-lg m-0 p-0">1. Nezbytně nutné (Technické)</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Tyto cookies jsou klíčové pro správné fungování webu. Zajišťují technické funkce, jako je přihlášení uživatele, zabezpečení nebo uložení obsahu košíku/rozpracovaného projektu.
                    </p>
                    <p className="text-xs text-gray-500">
                      <em>Příklady: session_id, csrf_token, firebase_auth</em>
                    </p>
                  </div>

                  <div className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <h3 className="font-bold text-lg m-0 p-0">2. Funkční a Preferenční</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Umožňují webu zapamatovat si vaše volby (např. jazykovou verzi, region) a poskytovat vylepšené a personalizované funkce.
                    </p>
                    <p className="text-xs text-gray-500">
                      <em>Příklady: i18next_lng, theme_preference</em>
                    </p>
                  </div>

                  <div className="border rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <h3 className="font-bold text-lg m-0 p-0">3. Analytické</h3>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Pomáhají nám pochopit, jak návštěvníci web používají. Data sbíráme anonymně a využíváme je k opravě chyb a vylepšování uživatelského prostředí.
                    </p>
                    <p className="text-xs text-gray-500">
                      <em>Příklady: Google Analytics (_ga), Hotjar</em>
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2>Cookies třetích stran</h2>
                <p>
                  Na některých stránkách se může zobrazovat obsah ze služeb třetích stran (např. videa z YouTube, mapy Google, platební brána Stripe). Tyto služby si mohou do vašeho zařízení ukládat vlastní cookies, nad kterými nemáme kontrolu.
                </p>
                <ul className="list-disc pl-5">
                  <li><strong>Stripe:</strong> pro detekci podvodů a zajištění bezpečných plateb.</li>
                  <li><strong>Google/Youtube:</strong> při přehrávání videí v portfoliu.</li>
                </ul>
              </section>

              <section>
                <h2>Jak odmítnout používání souborů cookie</h2>
                <p>
                  Používání souborů cookie lze nastavit pomocí vašeho internetového prohlížeče. Většina prohlížečů soubory cookie automaticky přijímá již ve výchozím nastavení. Soubory cookie lze pomocí vašeho webového prohlížeče odmítnout nebo nastavit užívání jen některých souborů cookie.
                </p>
              </section>

              <div className="bg-gray-100 p-6 rounded-lg text-center mt-8">
                <p className="font-semibold mb-3">Chcete změnit své nastavení cookies pro tento web?</p>
                <Button variant="outline" onClick={() => { /* Open cookie consent modal logic here */ alert('Zde by se otevřelo nastavení cookies'); }}>
                  Otevřít nastavení cookies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

