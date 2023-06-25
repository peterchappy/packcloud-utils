import { hasMonthInString, Month, months } from './dates'; // replace with your actual module name

describe('hasMonthInString', () => {
    it('returns true if the full month name is present', () => {
        for (const month of months) {
            expect(hasMonthInString(`This is a string with the month ${month.full} in it`)).toBe(true);
        }
    });

    it('returns true if the abbreviated month name is present', () => {
        for (const month of months) {
            expect(hasMonthInString(`This is a string with the month ${month.abbreviation} in it`)).toBe(true);
        }
    });

    it('returns false if there is no month name in the string', () => {
        expect(hasMonthInString('This is a string with no month in it')).toBe(false);
    });
});
