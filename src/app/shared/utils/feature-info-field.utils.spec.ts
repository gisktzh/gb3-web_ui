import {formatDateValue} from './feature-info-field.utils';

describe('feature-info-field utils', () => {
  it('formats date values in Swiss format without timezone shifts', () => {
    expect(formatDateValue('2024-07-15')).toBe('15.07.2024');
    expect(formatDateValue('2026-07-15T14:30:00')).toBe('15.07.2026 14:30:00');
    expect(formatDateValue('2026-01-15T14:30:00.000+01:00')).toBe('15.01.2026 13:30:00');
    expect(formatDateValue('2026-07-15T14:30:00.000+02:00')).toBe('15.07.2026 12:30:00');
  });

  it('formats date values with hours and minutes when input contains time', () => {
    expect(formatDateValue('2026-07-15T14:30')).toBe('15.07.2026 14:30');
    expect(formatDateValue('2026-07-15 14:30')).toBe('15.07.2026 14:30');
  });

  it('returns original string value for invalid dates', () => {
    expect(formatDateValue('not-a-date')).toBe('not-a-date');
    expect(formatDateValue('notadate')).toBe('notadate');
  });
});
