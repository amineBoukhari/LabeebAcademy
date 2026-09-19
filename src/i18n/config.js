export const locales = ['fr', 'ar'];
export const defaultLocale = 'fr';

/** Nav + chrome strings. Page copy lives in src/data/*.js. */
export const ui = {
  fr: {
    'nav.services': 'Services',
    'nav.travel': 'Labeeb Travel',
    'nav.team': 'Notre équipe',
    'nav.contact': 'Contact',
    'nav.story': 'Notre histoire',
    'nav.write': 'Nous écrire',
    'nav.online': 'Formation en ligne',
    'nav.presential': 'Formation VIP présentielle',
    'nav.mastermind': 'Mastermind & Masterclass',
    'nav.consulting': 'Consulting 1 to 1',
    'nav.support': 'Accompagnement',
    'nav.disc': 'Test psychologique DISC',
    'nav.coursesCount': '2 parcours',
    'footer.place': 'Labeeb Academy — Constantine, Algérie'
  },
  ar: {
    'nav.services': 'الخدمات',
    'nav.travel': 'Labeeb Travel',
    'nav.team': 'فريقنا',
    'nav.contact': 'اتصل بنا',
    'nav.story': 'قصتنا',
    'nav.write': 'راسلنا',
    'nav.online': 'تكوين عن بعد',
    'nav.presential': 'تكوين حضوري',
    'nav.mastermind': 'ماستر مايند',
    'nav.consulting': 'استشارة فردية',
    'nav.support': 'مواكبة',
    'nav.disc': 'اختبار DISC',
    'nav.coursesCount': 'مسارين',
    'footer.place': 'Labeeb Academy — قسنطينة، الجزائر'
  }
};

/** French slugs stay the canonical route names in both locales. */
export const routes = {
  home: '',
  online: 'formations-en-ligne',
  presential: 'formation-presentielle',
  mastermind: 'mastermind-masterclass',
  consulting: 'consulting-1-to-1',
  support: 'accompagnement',
  disc: 'test-disc',
  travel: 'labeeb-travel',
  team: 'notre-equipe',
  story: 'notre-histoire',
  contact: 'contact'
};
