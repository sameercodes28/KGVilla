import { cn } from './utils';

describe('cn (className utility)', () => {
    it('should merge class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
        expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
    });

    it('should handle undefined and null', () => {
        expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should merge Tailwind classes correctly', () => {
        // tailwind-merge should handle conflicts
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle empty inputs', () => {
        expect(cn()).toBe('');
    });

    it('should handle arrays', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });
});
