import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {FeatureInfoReportDownloadComponent} from './feature-info-report-download.component';

describe('FeatureInfoReportDownloadComponent', () => {
  let component: FeatureInfoReportDownloadComponent;
  let fixture: ComponentFixture<FeatureInfoReportDownloadComponent>;
  let compiled: HTMLElement;

  const reportUrl = signal('https://example.com/report.pdf');
  const reportDescription = signal<string | null | undefined>(undefined);

  beforeEach(async () => {
    reportUrl.set('https://example.com/report.pdf');
    reportDescription.set(undefined);

    await TestBed.configureTestingModule({
      imports: [FeatureInfoReportDownloadComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoReportDownloadComponent, {
      bindings: [inputBinding('reportUrl', reportUrl), inputBinding('reportDescription', reportDescription)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('report description', () => {
    it('should not render the description when it is undefined', () => {
      expect(compiled.querySelector('.map-overlay__report__description')).toBeNull();
    });

    it('should not render the description when it is null', () => {
      reportDescription.set(null);
      fixture.detectChanges();

      expect(compiled.querySelector('.map-overlay__report__description')).toBeNull();
    });

    it('should render the description when provided', () => {
      reportDescription.set('This is the report description.');
      fixture.detectChanges();

      const description = compiled.querySelector('.map-overlay__report__description');

      expect(description).toBeTruthy();
      expect(description?.textContent?.trim()).toBe('This is the report description.');
    });

    it('should update the description when the input changes', () => {
      reportDescription.set('First description');
      fixture.detectChanges();

      expect(compiled.querySelector('.map-overlay__report__description')?.textContent?.trim()).toBe('First description');

      reportDescription.set('Updated description');
      fixture.detectChanges();

      expect(compiled.querySelector('.map-overlay__report__description')?.textContent?.trim()).toBe('Updated description');
    });
  });

  describe('download link', () => {
    it('should render the download link', () => {
      const link = compiled.querySelector('.map-overlay__report__download-button__container a');

      expect(link).toBeTruthy();
    });

    it('should use the report URL as the link href', () => {
      const link = compiled.querySelector('.map-overlay__report__download-button__container a') as HTMLAnchorElement;

      expect(link.href).toBe('https://example.com/report.pdf');
    });

    it('should update the link when the report URL changes', () => {
      reportUrl.set('https://example.com/updated-report.pdf');
      fixture.detectChanges();

      const link = compiled.querySelector('.map-overlay__report__download-button__container a') as HTMLAnchorElement;

      expect(link.href).toBe('https://example.com/updated-report.pdf');
    });

    it('should open the report in a new tab', () => {
      const link = compiled.querySelector('.map-overlay__report__download-button__container a') as HTMLAnchorElement;

      expect(link.target).toBe('_blank');
    });

    it('should render the download button text', () => {
      const link = compiled.querySelector('.map-overlay__report__download-button__container a');

      expect(link?.textContent).toContain('Report herunterladen');
    });

    it('should render the download icon', () => {
      const icons = compiled.querySelectorAll('.map-overlay__report__download-button__container mat-icon');

      expect(icons).toHaveLength(1);
      expect(icons[0].textContent?.trim()).toBe('download');
    });
  });

  describe('header', () => {
    it('should render the PDF icon', () => {
      const icon = compiled.querySelector('map-overlay-list-item mat-icon[header-icon]');

      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('picture_as_pdf');
    });

    it('should render the report download content', () => {
      const content = compiled.querySelector('.map-overlay__report__download-button__container');

      expect(content).toBeTruthy();
      expect(content?.textContent).toContain('Report herunterladen');
    });
  });
});
