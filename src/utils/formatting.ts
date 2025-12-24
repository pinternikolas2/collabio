import { format } from 'date-fns';
import { cs, sk } from 'date-fns/locale';
import i18n from '../i18n/config';

export const formatCurrency = (amount: number, currencyCode: string = 'CZK') => {
    const currentLang = i18n.language;

    if (currentLang === 'sk' && currencyCode === 'CZK') {
        // Rough approximation for demo or specific static conversion if needed
        // Ideally, the prices should come in EUR from backend for SK users.
        // For now, we will display currency based on the original currency code but formatted for the locale,
        // OR we can pretend everything is EUR for SK if the user wants.
        // Let's stick to formatting the given currency correctly first.

        // If we want to force EUR display for SK users (converting mock data):
        // const eurAmount = amount / 25;
        // return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(eurAmount);
    }

    // Use native Intl.NumberFormat
    // 'cs-CZ' uses styling like '1 500 Kč'
    // 'sk-SK' uses styling like '1 500 €' (if currency was EUR) or '1 500 CZK'
    const locale = currentLang === 'sk' ? 'sk-SK' : 'cs-CZ';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (date: Date | string | number, formatStr: string = 'PP') => {
    const dateObj = new Date(date);
    const currentLang = i18n.language;
    const locale = currentLang === 'sk' ? sk : cs;

    return format(dateObj, formatStr, { locale });
};
