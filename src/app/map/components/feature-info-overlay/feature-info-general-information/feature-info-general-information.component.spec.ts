import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {FeatureInfoGeneralInformationComponent} from './feature-info-general-information.component';
import {GeneralInfoResponse} from '../../../../shared/interfaces/general-info.interface';
import {provideMockStore} from '@ngrx/store/testing';

describe('FeatureInfoGeneralInformationComponent', () => {
  let component: FeatureInfoGeneralInformationComponent;
  let fixture: ComponentFixture<FeatureInfoGeneralInformationComponent>;
  let compiled: HTMLElement;

  const generalInfoData = signal<GeneralInfoResponse>({
    locationInformation: {
      queryPosition: {
        coordinates: [123.456, 789.012],
      },
      heightDtm: 456.789,
      heightDom: 567.891,
    },
    alternativeSpatialReferences: [
      {
        name: 'LV03',
        coordinates: [600000, 200000],
      },
      {
        name: 'LV95',
        coordinates: [2600000, 1200000],
      },
    ],
    externalMaps: [
      {
        name: 'Google Maps',
        url: 'https://maps.google.com/',
      },
      {
        name: 'OpenStreetMap',
        url: 'https://www.openstreetmap.org/',
      },
    ],
    parcel: {
      oerebExtract: {
        pdfUrl: 'https://example.com/oereb.pdf',
      },
      ownershipInformation: {
        url: 'https://example.com/ownership',
      },
    },
  } as GeneralInfoResponse);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoGeneralInformationComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoGeneralInformationComponent, {
      bindings: [inputBinding('generalInfoData', generalInfoData)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('general information', () => {
    it('should render the coordinates', () => {
      const header = compiled.querySelector('.general-information__header__title');

      expect(header?.textContent).toContain('123.456 / 789.012');
    });

    it('should render DTM and DOM heights with up to two decimal places', () => {
      const header = compiled.querySelector('.general-information__header__title');

      expect(header?.textContent).toContain('DTM: 456.79 m');
      expect(header?.textContent).toContain('DOM: 567.89 m');
    });

    it('should initially show the collapsed arrow icon', () => {
      const icon = compiled.querySelector('.general-information__header__toggle') as HTMLElement;

      expect(icon).toBeTruthy();
      expect(icon.getAttribute('fontIcon')).toBe('arrow_right');
    });

    it('should change the arrow icon when the expansion panel is expanded', () => {
      const header = compiled.querySelector('.general-information__header') as HTMLElement;

      header.click();
      fixture.detectChanges();

      const icon = compiled.querySelector('.general-information__header__toggle') as HTMLElement;

      expect(icon.getAttribute('fontIcon')).toBe('arrow_drop_down');
    });

    it('should render alternative spatial references', () => {
      const additionalContent = compiled.querySelector('.general-information__additional-content');

      expect(additionalContent?.textContent).toContain('LV03:');
      expect(additionalContent?.textContent).toContain('600000 / 200000');
      expect(additionalContent?.textContent).toContain('LV95:');
      expect(additionalContent?.textContent).toContain('2600000 / 1200000');
    });

    it('should render external map links', () => {
      const links = compiled.querySelectorAll('.general-information__additional-content__links__ref');

      expect(links).toHaveLength(2);

      expect(links[0].textContent?.trim()).toBe('Google Maps');
      expect(links[0].getAttribute('href')).toBe('https://maps.google.com/');
      expect(links[0].getAttribute('title')).toBe('Google Maps');
      expect(links[0].getAttribute('target')).toBe('_blank');
      expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');

      expect(links[1].textContent?.trim()).toBe('OpenStreetMap');
      expect(links[1].getAttribute('href')).toBe('https://www.openstreetmap.org/');
      expect(links[1].getAttribute('title')).toBe('OpenStreetMap');
      expect(links[1].getAttribute('target')).toBe('_blank');
      expect(links[1].getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should render the additional content when the expansion panel is opened', () => {
      const panel = fixture.debugElement.query(By.css('mat-expansion-panel'));

      const header = panel.query(By.css('mat-expansion-panel-header'));

      header.nativeElement.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.general-information__additional-content')).toBeTruthy();
    });
  });

  describe('when general information data changes', () => {
    it('should update the rendered coordinates', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [111.222, 333.444],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 10,
          heightDom: 20,
        },
        alternativeSpatialReferences: [],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      const title = compiled.querySelector('.general-information__header__title');

      expect(title?.textContent).toContain('111.222 / 333.444');
      expect(title?.textContent).not.toContain('123.456 / 789.012');
    });

    it('should update the rendered heights', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [1, 2],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 123.4,
          heightDom: 987.65,
        },
        alternativeSpatialReferences: [],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      const title = compiled.querySelector('.general-information__header__title');

      expect(title?.textContent).toContain('DTM: 123.4 m');
      expect(title?.textContent).toContain('DOM: 987.65 m');
    });

    it('should remove alternative spatial references when the collection becomes empty', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [1, 2],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 10,
          heightDom: 20,
        },
        alternativeSpatialReferences: [],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      const content = compiled.querySelector('.general-information__additional-content');

      expect(content?.textContent).not.toContain('LV03');
      expect(content?.textContent).not.toContain('LV95');
    });

    it('should remove external map links when the collection becomes empty', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [1, 2],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 10,
          heightDom: 20,
        },
        alternativeSpatialReferences: [],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      expect(compiled.querySelectorAll('.general-information__additional-content__links__ref')).toHaveLength(0);
    });
  });

  describe('external links', () => {
    it('should render the ÖREB extract link when the parcel contains an extract URL and the feature is enabled', () => {
      const link = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.external-links__button')).find((element) =>
        element.textContent?.includes('ÖREB-Auszug'),
      );

      if (link) {
        expect(link.getAttribute('href')).toBe('https://example.com/oereb.pdf');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(link.textContent).toContain('ÖREB-Auszug');
      }
    });

    it('should render the ownership information link when the parcel contains an ownership URL and the feature is enabled', () => {
      const link = Array.from(compiled.querySelectorAll<HTMLAnchorElement>('.external-links__button')).find((element) =>
        element.textContent?.includes('Eigentümerabfrage'),
      );

      if (link) {
        expect(link.getAttribute('href')).toBe('https://example.com/ownership');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener');
        expect(link.textContent).toContain('Eigentümerabfrage');
      }
    });

    it('should not render parcel links when parcel data is absent', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [1, 2],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 10,
          heightDom: 20,
        },
        alternativeSpatialReferences: [],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      expect(
        Array.from(compiled.querySelectorAll('.external-links__button')).filter((element) => element.textContent?.includes('ÖREB-Auszug')),
      ).toHaveLength(0);

      expect(
        Array.from(compiled.querySelectorAll('.external-links__button')).filter((element) =>
          element.textContent?.includes('Eigentümerabfrage'),
        ),
      ).toHaveLength(0);
    });
  });

  describe('empty collections', () => {
    it('should render without alternative spatial references', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [10, 20],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 100,
          heightDom: 200,
        },
        alternativeSpatialReferences: [],
        externalMaps: [
          {
            name: 'Only map',
            url: 'https://example.com/map',
          },
        ],
        parcel: undefined,
      });

      fixture.detectChanges();

      expect(compiled.querySelectorAll('.general-information__additional-content__links__ref')).toHaveLength(1);
    });

    it('should render without external maps', () => {
      generalInfoData.set({
        locationInformation: {
          queryPosition: {
            coordinates: [10, 20],
            type: 'Point',
            srs: 2056,
          },
          heightDtm: 100,
          heightDom: 200,
        },
        alternativeSpatialReferences: [
          {
            name: 'Reference',
            coordinates: [30, 40],
            crs: '4096',
          },
        ],
        externalMaps: [],
        parcel: undefined,
      });

      fixture.detectChanges();

      const content = compiled.querySelector('.general-information__additional-content');

      expect(content?.textContent).toContain('Reference');
      expect(compiled.querySelectorAll('.general-information__additional-content__links__ref')).toHaveLength(0);
    });
  });
});
