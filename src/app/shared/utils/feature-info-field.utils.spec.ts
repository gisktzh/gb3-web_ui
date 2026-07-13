import {formatFeatureInfoFieldValue} from './feature-info-field.utils';

describe('feature-info-field utils', () => {
  it('formats date values in Swiss format without timezone shifts', () => {
    expect(formatFeatureInfoFieldValue('2024-07-15', 'date')).toBe('15.07.2024');
    expect(formatFeatureInfoFieldValue('2026-07-15T14:30:00', 'date')).toBe('15.07.2026, 14:30:00');
    expect(formatFeatureInfoFieldValue('2026-01-15T14:30:00.000+01:00', 'date')).toBe('15.01.2026, 13:30:00');
    expect(formatFeatureInfoFieldValue('2026-07-15T14:30:00.000+02:00', 'date')).toBe('15.07.2026, 12:30:00');
  });

  it('converts text values to strings', () => {
    expect(formatFeatureInfoFieldValue('42', 'text')).toBe('42');
    expect(formatFeatureInfoFieldValue('42', 'text')).toBe('42');
  });
});
