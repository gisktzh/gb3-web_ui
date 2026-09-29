import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideMockStore} from '@ngrx/store/testing';
import {selectScrollbarWidth} from 'src/app/state/app/reducers/app-layout.reducer';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';
import {OerebExtractComponent} from './oereb-extract.component';

describe('OerebExtractComponent', () => {
  let fixture: ComponentFixture<OerebExtractComponent>;
  let component: OerebExtractComponent;
  let compiled: HTMLElement;

  const data = signal<OerebExtractResponse>({
    municipalityName: 'Zürich',
    municipalityCode: 261,
    parcelNumber: 'ZH-42',
    egrid: 'CH123',
    kbo: {title: 'Cadastre office', href: 'https://example.test/cadastre'},
    surveyor: {title: 'Surveyor'},
    staticExtractUrl: 'https://example.test/extract.pdf',
    concernedThemes: [
      {
        id: 1,
        name: 'Land-use planning',
        legalProvisions: [{title: 'Provision', href: 'https://example.test/provision'}],
        laws: [],
        hints: [],
        responsibleOffices: [{title: 'Planning office'}],
        restrictions: [{id: 2, name: 'Residential zone', measurement: {areaM2: 120, percentage: 0.25}}],
      },
    ],
    notConcernedThemes: [{id: 3, name: 'Forest boundaries', hints: [{title: 'No restriction'}]}],
    notAvailableThemes: [{id: 4, name: 'Noise', hints: [{title: 'Unavailable', href: 'https://example.test/noise'}]}],
  });

  class MockResizeObserver implements ResizeObserver {
    public readonly observe = vi.fn();
    public readonly unobserve = vi.fn();
    public readonly disconnect = vi.fn();
  }

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    await TestBed.configureTestingModule({
      imports: [OerebExtractComponent],
      providers: [provideRouter([]), provideMockStore({selectors: [{selector: selectScrollbarWidth, value: 17}]})],
    }).compileComponents();

    fixture = TestBed.createComponent(OerebExtractComponent, {bindings: [inputBinding('data', data)]});
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.unstubAllGlobals();
  });

  it('maps parcel and authority data into display tables', () => {
    const cadastreRows = component.oerebCadastreData().tableRows;
    expect(cadastreRows.get('Gemeinde')?.[0].displayValue).toBe('Zürich');
    expect(cadastreRows.get('BFS-Nr.')?.[0].displayValue).toBe('261');
    expect(cadastreRows.get('Grundstück-Nr.')?.[0].displayValue).toBe('ZH-42');
    expect(cadastreRows.get('EGRIS_EGRID')?.[0].displayValue).toBe('CH123');

    expect(component.kboAndSurveyorData().tableRows.get('ÖREB-Kataster')?.[0]).toEqual({
      displayValue: 'Cadastre office',
      cellType: 'url',
      url: 'https://example.test/cadastre',
    });
    expect(component.kboAndSurveyorData().tableRows.get('Email ÖREB')?.[0]).toEqual({
      displayValue: 'Surveyor',
      cellType: 'text',
    });
  });

  it('renders a safe external link to the printable extract', () => {
    const link = compiled.querySelector<HTMLAnchorElement>('.oereb-extract__static-link__button');
    expect(link?.getAttribute('href')).toBe('https://example.test/extract.pdf');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('maps concerned themes and their restriction measurements', () => {
    const theme = component.concernedThemes()[0];
    expect(theme.name).toBe('Land-use planning');
    expect(theme.generalInfo.items).toHaveLength(2);
    expect(theme.restrictions[0].items).toEqual([
      {itemLabel: 'Fläche', itemType: 'text', text: '120m2'},
      {itemLabel: 'Anteil', itemType: 'text', text: '25%'},
    ]);
    expect(compiled.textContent).toContain('Betroffene Themen');
    expect(compiled.textContent).toContain('Land-use planning');
  });

  it('maps and renders non-concerned and unavailable themes separately', () => {
    expect(component.notConcernedThemes().tableRows.get('Forest boundaries')?.[0]).toEqual({
      displayValue: '',
      cellType: 'list',
      items: [{cellType: 'text', displayValue: 'No restriction'}],
    });
    expect(component.notAvailableThemes().tableRows.get('Noise')?.[0]).toEqual({
      displayValue: '',
      cellType: 'list',
      items: [{cellType: 'url', displayValue: 'Unavailable', url: 'https://example.test/noise'}],
    });
    expect(compiled.textContent).toContain('Nicht betroffene Themen');
    expect(compiled.textContent).toContain('Nicht verfügbare Themen');
  });
});
