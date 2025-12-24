export const validateICO = (ico: string): boolean => {
    // Remove whitespace
    const cleanIco = ico.replace(/\s/g, '');

    // Must be 8 digits
    if (!/^\d{8}$/.test(cleanIco)) {
        return false;
    }

    // Weighted sum check
    const weights = [8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < 7; i++) {
        sum += parseInt(cleanIco[i], 10) * weights[i];
    }

    const remainder = sum % 11;
    let checkDigit = 0;

    if (remainder === 0) {
        checkDigit = 1;
    } else if (remainder === 1) {
        checkDigit = 0;
    } else {
        checkDigit = 11 - remainder;
    }

    return parseInt(cleanIco[7], 10) === checkDigit;
};

export const validatePhone = (phone: string): boolean => {
    // Remove whitespace
    const cleanPhone = phone.replace(/\s/g, '');

    // CZ (+420) or SK (+421) followed by 9 digits
    return /^(\+420|\+421)\d{9}$/.test(cleanPhone);
};

export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
