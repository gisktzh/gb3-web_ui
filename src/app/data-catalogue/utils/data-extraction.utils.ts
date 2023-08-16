import {DepartmentalContact} from '../../shared/interfaces/gb3-metadata.interface';

import {DataDisplayElement} from '../types/data-display-element.type';

export class DataExtractionUtils {
  public static extractContactElements(contact: DepartmentalContact): DataDisplayElement[] {
    return [
      {title: 'Organisation', value: contact.department, type: 'text'},
      {title: 'Abteilung', value: contact.division, type: 'text'},
      {title: 'Kontaktperson', value: `${contact.firstName} ${contact.lastName}`, type: 'text'},
      {title: 'Adresse', value: `${contact.street} ${contact.houseNumber}, ${contact.zipCode} ${contact.village}`, type: 'text'},
      {title: 'Tel', value: contact.phone, type: 'text'},
      {title: 'Tel direkt', value: contact.phoneDirect, type: 'text'},
      {title: 'E-Mail', value: contact.email, type: 'email'},
      {title: 'www', value: contact.url, type: 'url'},
    ];
  }
}
