import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {DatasetLayer} from '../../../../shared/interfaces/dataset-layer.interface';
import {DatasetElementDetailComponent} from './dataset-element-detail.component';

describe('DatasetElementDetailComponent', () => {
  let fixture: ComponentFixture<DatasetElementDetailComponent>;
  let element: HTMLElement;

  const layer: DatasetLayer = {
    id: 'layer-7',
    name: 'Buildings',
    description: 'All buildings',
    geometryType: 'Polygon',
    path: 'buildings.gdb',
    metadataVisibility: 'public',
    dataProcurementType: 'download',
    attributes: [{name: 'height', description: 'Height', type: 'number', unit: 'm'}],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetElementDetailComponent],
      providers: [provideMockStore(), provideUiTour()],
    }).compileComponents();
    fixture = TestBed.createComponent(DatasetElementDetailComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('shows layer details and delegates its attributes to the table', () => {
    fixture.componentRef.setInput('layer', layer);
    fixture.detectChanges();

    expect(element.querySelector('h3')?.textContent).toContain('Buildings');
    expect(fixture.componentInstance.layerListData()).toEqual([
      {title: 'GIS-ZH Nr.', value: 'layer-7', type: 'text'},
      {title: 'Beschreibung', value: 'All buildings', type: 'text'},
      {title: 'Geometrietyp', value: 'Polygon', type: 'text'},
      {title: 'Pfad/Filename', value: 'buildings.gdb', type: 'text'},
      {title: 'Metadaten Sichtbarkeit', value: 'public', type: 'text'},
      {title: 'Datenbezugsart', value: 'download', type: 'text'},
    ]);
    expect(element.querySelector('dataset-element-table')).toBeTruthy();
  });
});
