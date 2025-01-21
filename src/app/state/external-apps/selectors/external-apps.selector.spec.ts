import {selectExternalAppsForAccessMode} from './external-apps.selector';
import {ExternalApp} from '../../../shared/interfaces/external-app.interface';

const mockData: ExternalApp[] = [
  {
    visibility: 'internet',
    title: 'internet',
  } as ExternalApp,
  {
    visibility: 'intranet',
    title: 'intranet',
  } as ExternalApp,
  {
    visibility: 'both',
    title: 'both',
  } as ExternalApp,
];
describe('selectExternalAppsForAccessMode', () => {
  it('returns "both" and "internet" if accessmode is internet', () => {
    const actual = selectExternalAppsForAccessMode.projector(mockData, 'internet');

    const expected = mockData.filter((v) => v.visibility !== 'intranet');
    expect(actual).toEqual(expected);
  });

  it('returns "both" and "intranet" if accessmode is intranet', () => {
    const actual = selectExternalAppsForAccessMode.projector(mockData, 'intranet');

    const expected = mockData.filter((v) => v.visibility !== 'internet');
    expect(actual).toEqual(expected);
  });
});
