import {AbstractLinksGroup, LinksGroup} from '../interfaces/links-group.interface';
import {TestBed} from '@angular/core/testing';
import {LinksGroupsService} from './links-groups.service';
import {RelativeLinkObject} from '../interfaces/relative-link-object.interface';
import {LinkObject} from '../interfaces/link-object.interface';

describe('BaseUrlTypeService', () => {
  let service: LinksGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinksGroupsService);
  });
  describe('convertAbstractLinksGroupsToLinksGroups', () => {
    it('converts  AbstarctLinksGroups correctly', () => {
      const mockAbstractLinksGroups: AbstractLinksGroup[] = [
        {
          label: 'Group One',
          links: [
            {title: 'Relative Link 1', relativeUrl: '/something', baseUrlType: 'Geolion'},
            {title: 'Link1', href: 'geo.zh.ch'},
          ],
        },
      ];
      const expected: LinksGroup[] = [
        {
          label: 'Group One',
          links: [
            {title: 'Relative Link 1', href: 'https://www.geolion.zh.ch/something'},
            {title: 'Link1', href: 'geo.zh.ch'},
          ],
        },
      ];

      const actual = service.convertAbstractLinksGroupsToLinksGroups(mockAbstractLinksGroups);
      expect(actual).toEqual(expected);
    });
  });
  describe('convertRelativeLinkObjectToLinkObject', () => {
    it('converts  RelativeLinkObjects to LinkObjects correctly', () => {
      const mockRelativeLinkObject: RelativeLinkObject = {title: 'Relative Link 1', relativeUrl: '/something', baseUrlType: 'Geolion'};
      const expected: LinkObject = {title: 'Relative Link 1', href: 'https://www.geolion.zh.ch/something'};

      const actual = service.convertRelativeLinkObjectToLinkObject(mockRelativeLinkObject);
      expect(actual).toEqual(expected);
    });
    it('does nothing if LinkObject provided', () => {
      const mockRelativeLinkObject: LinkObject = {title: 'Relative Link 1', href: 'https://www.geolion.zh.ch/something'};
      const expected: LinkObject = {title: 'Relative Link 1', href: 'https://www.geolion.zh.ch/something'};

      const actual = service.convertRelativeLinkObjectToLinkObject(mockRelativeLinkObject);
      expect(actual).toEqual(expected);
    });
  });
});
