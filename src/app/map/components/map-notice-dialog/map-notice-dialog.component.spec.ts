import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {MapNoticeDialogComponent} from './map-notice-dialog.component';
import {immerable} from 'immer';
import {AddToMapVisitor} from '../../interfaces/add-to-map.visitor';

describe('MapNoticeDialogComponent', () => {
  let component: MapNoticeDialogComponent;
  let fixture: ComponentFixture<MapNoticeDialogComponent>;
  let compiled: HTMLElement;

  const activeMapItemsWithNoticesMock: Gb2WmsActiveMapItem[] = [
    {
      title: 'Orthophoto',
      isSingleLayer: false,
      mapImageUrl: 'https://example.com/orthophoto.png',
      settings: {
        notice: 'Orthophoto map notice',
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      geometadataUuid: null,
      addToMap: function (_1: AddToMapVisitor, _2: number): void {
        throw new Error('Function not implemented.');
      },
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    },
    {
      title: 'Cadastral map',
      isSingleLayer: true,
      mapImageUrl: 'https://example.com/cadastral.png',
      settings: {
        notice: 'Cadastral map notice',
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      geometadataUuid: null,
      addToMap: function (_1: AddToMapVisitor, _2: number): void {
        throw new Error('Function not implemented.');
      },
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    },
    {
      title: 'Map without preview',
      isSingleLayer: false,
      mapImageUrl: '',
      settings: {
        notice: 'Map without preview notice',
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
      id: '',
      geometadataUuid: null,
      addToMap: function (_1: AddToMapVisitor, _2: number): void {
        throw new Error('Function not implemented.');
      },
      visible: false,
      opacity: 0,
      loadingState: undefined,
      viewProcessState: undefined,
      isTemporary: false,
      [immerable]: true,
    },
  ];

  const dialogRefMock: Partial<MatDialogRef<MapNoticeDialogComponent>> = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MapNoticeDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: activeMapItemsWithNoticesMock,
        },
        {provide: MatDialogRef, useValue: dialogRefMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapNoticeDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('map notices', () => {
    it('should render one notice for every active map item', () => {
      const notices = compiled.querySelectorAll('.map-notice');

      expect(notices).toHaveLength(3);
    });

    it('should render the map titles', () => {
      const titles = compiled.querySelectorAll('.map-notice__text-section__title');

      expect(titles).toHaveLength(3);
      expect(titles[0].textContent?.trim()).toBe('Orthophoto');
      expect(titles[1].textContent?.trim()).toBe('Cadastral map');
      expect(titles[2].textContent?.trim()).toBe('Map without preview');
    });

    it('should render the map notices', () => {
      const noticeTexts = compiled.querySelectorAll('.map-notice__text-section .mat-body');

      expect(noticeTexts).toHaveLength(3);
      expect(noticeTexts[0].textContent?.trim()).toBe('Orthophoto map notice');
      expect(noticeTexts[1].textContent?.trim()).toBe('Cadastral map notice');
      expect(noticeTexts[2].textContent?.trim()).toBe('Map without preview notice');
    });

    it('should render an image for a non-single-layer item with an image URL', () => {
      const images = compiled.querySelectorAll<HTMLImageElement>('.map-notice__image');

      expect(images).toHaveLength(1);
      expect(images[0].src).toBe('https://example.com/orthophoto.png');
      expect(images[0].alt).toBe('Orthophoto');
    });

    it('should not render an image for a single-layer item', () => {
      const images = compiled.querySelectorAll<HTMLImageElement>('.map-notice__image');

      expect(Array.from(images).some((image) => image.alt === 'Cadastral map')).toBe(false);
    });

    it('should not render an image when the map image URL is missing', () => {
      const images = compiled.querySelectorAll<HTMLImageElement>('.map-notice__image');

      expect(Array.from(images).some((image) => image.alt === 'Map without preview')).toBe(false);
    });

    it('should render each notice text section', () => {
      const sections = compiled.querySelectorAll('.map-notice__text-section');

      expect(sections).toHaveLength(3);
    });
  });

  describe('empty map notices', () => {
    it('should render no map notices when the dialog data is empty', async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [MapNoticeDialogComponent],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: [] as Gb2WmsActiveMapItem[],
          },
          {provide: MatDialogRef, useValue: dialogRefMock},
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(MapNoticeDialogComponent);
      component = fixture.componentInstance;
      compiled = fixture.nativeElement as HTMLElement;
      fixture.detectChanges();

      expect(compiled.querySelectorAll('.map-notice')).toHaveLength(0);
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith();
    });

    it('should close the dialog when the close button is clicked', () => {
      const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find((element) =>
        element.textContent?.includes('Schliessen'),
      );

      expect(button).toBeTruthy();

      button?.click();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
    });
  });
});
