import {DepartmentalContact} from '../../shared/interfaces/gb3-metadata.interface';
import {DataExtractionUtils} from './data-extraction.utils';

import {DataDisplayElement} from '../types/data-display-element.type';

describe('DataExtractionUtils', () => {
  it('extracts the contact elements correctly', () => {
    const mockContact: DepartmentalContact = {
      department: 'Department of Tests',
      email: {href: 'example@example.com'},
      firstName: 'Leeroy',
      houseNumber: 1337,
      lastName: 'Jenkins',
      phone: '42',
      phoneDirect: '212',
      division: 'Division of Unit Tests',
      street: 'Rue du Tests',
      village: 'Testhausen',
      zipCode: 2222,
      poBox: null,
      section: null,
      url: 'https://www.example.com',
    };

    const result = DataExtractionUtils.extractContactElements(mockContact);

    const expected: DataDisplayElement[] = [
      {title: 'Organisation', value: mockContact.department, type: 'text'},
      {title: 'Abteilung', value: mockContact.division, type: 'text'},
      {title: 'Kontaktperson', value: `${mockContact.firstName} ${mockContact.lastName}`, type: 'text'},
      {
        title: 'Adresse',
        value: `${mockContact.street} ${mockContact.houseNumber}, ${mockContact.zipCode} ${mockContact.village}`,
        type: 'text',
      },
      {title: 'Tel', value: mockContact.phone, type: 'text'},
      {title: 'Tel direkt', value: mockContact.phoneDirect, type: 'text'},
      {title: 'E-Mail', value: mockContact.email.href, type: 'url', displayText: undefined},
      {title: 'www', value: mockContact.url, type: 'url'},
    ];
    expect(result).toEqual(expected);
  });
});
