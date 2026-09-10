import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionPanel} from '@angular/material/expansion';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemComponent} from './active-map-item.component';
import {inputBinding, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {immerable} from 'immer';
import {ActiveMapItemHeaderComponent} from '../active-map-item-header/active-map-item-header.component';

describe('ActiveMapItemComponent', () => {
  let component: ActiveMapItemComponent;
  let fixture: ComponentFixture<ActiveMapItemComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const activeMapItem = signal({
    settings: {
      type: 'gb2Wms',
    },
  } as ActiveMapItem);
  const isFirstActiveMapItem = signal(false);
  const isLastActiveMapItem = signal(false);
  const isDragAndDropDisabled = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(ActiveMapItemComponent, {
      bindings: [
        inputBinding('activeMapItem', activeMapItem),
        inputBinding('isFirstActiveMapItem', isFirstActiveMapItem),
        inputBinding('isLastActiveMapItem', isLastActiveMapItem),
        inputBinding('isDragAndDropDisabled', isDragAndDropDisabled),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('connection lines', () => {
    it('should show the top connection line when it is not the first item and the panel is collapsed', () => {
      isFirstActiveMapItem.set(false);
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line-top')).toBeTruthy();
    });

    it('should not show the top connection line when it is the first item', () => {
      isFirstActiveMapItem.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line-top')).toBeNull();
    });

    it('should show the bottom connection line when it is not the last item', () => {
      isLastActiveMapItem.set(false);
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line-bottom')).toBeTruthy();
    });

    it('should not show the bottom connection line when it is the last item', () => {
      isLastActiveMapItem.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line-bottom')).toBeNull();
    });

    it('should add the mobile class to the connection lines in mobile mode', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      isLastActiveMapItem.set(false);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line--mobile')).toBeTruthy();
    });

    it('should not add the mobile class to the connection lines in regular mode', () => {
      store.overrideSelector(selectScreenMode, 'regular');
      isLastActiveMapItem.set(false);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line--mobile')).toBeNull();
    });

    it('should hide the top connection line when the panel is expanded', () => {
      activeMapItem.set({
        isSingleLayer: false,
        settings: {
          type: 'gb2Wms',
          layers: [],
          url: '',
          mapId: 'yes',
          isNoticeMarkedAsRead: true,
          [immerable]: true,
        },
        id: '',
        title: '',
        mapImageUrl: null,
        geometadataUuid: null,
        visible: false,
        opacity: 0,
        loadingState: undefined,
        viewProcessState: undefined,
        isTemporary: false,
        addToMap: vi.fn(),
        [immerable]: true,
      });

      const panel = fixture.debugElement.query(By.directive(MatExpansionPanel)).componentInstance as MatExpansionPanel;
      isFirstActiveMapItem.set(false);
      panel.open();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-item__connection-line-top')).toBeNull();
    });
  });

  describe('active map item', () => {
    it('should keep the layers tab selected for a regular map', () => {
      activeMapItem.set({isSingleLayer: false} as ActiveMapItem);
      fixture.detectChanges();

      expect(component.activeTab()).toBe('layers');
    });

    it('should select the settings tab when the active map item is a single layer', () => {
      activeMapItem.set({isSingleLayer: true} as ActiveMapItem);
      fixture.detectChanges();

      expect(component.activeTab()).toBe('settings');
    });

    it('should keep the settings tab if selected once via a single-layer map', () => {
      activeMapItem.set({isSingleLayer: true} as ActiveMapItem);
      fixture.detectChanges();

      expect(component.activeTab()).toBe('settings');

      activeMapItem.set({isSingleLayer: false} as ActiveMapItem);
      fixture.detectChanges();

      expect(component.activeTab()).toBe('settings');
    });
  });

  describe('tabs', () => {
    beforeEach(() => {
      activeMapItem.set({
        isSingleLayer: false,
        settings: {
          type: 'gb2Wms',
          layers: [],
          url: '',
          mapId: 'yes',
          isNoticeMarkedAsRead: true,
          [immerable]: true,
        },
        id: '',
        title: '',
        mapImageUrl: null,
        geometadataUuid: null,
        visible: false,
        opacity: 0,
        loadingState: undefined,
        viewProcessState: undefined,
        isTemporary: false,
        addToMap: vi.fn(),
        [immerable]: true,
      });

      const panel = fixture.debugElement.query(By.directive(MatExpansionPanel)).componentInstance as MatExpansionPanel;
      panel.open();

      fixture.detectChanges();
    });

    it('should show the layers tab by default', () => {
      const layersButton = getTabButton('Ebenen');
      const settingsButton = getTabButton('Einstellungen');

      expect(layersButton.classList.contains('active-map-item__tabs__header__buttons__button--selected')).toBe(true);
      expect(settingsButton.classList.contains('active-map-item__tabs__header__buttons__button--selected')).toBe(false);
    });

    it('should switch to the settings tab when clicking Einstellungen', () => {
      getTabButton('Einstellungen').click();
      fixture.detectChanges();

      expect(component.activeTab()).toBe('settings');
      expect(getTabButton('Einstellungen').classList.contains('active-map-item__tabs__header__buttons__button--selected')).toBe(true);
      expect(getTabButton('Ebenen').classList.contains('active-map-item__tabs__header__buttons__button--selected')).toBe(false);
    });

    it('should switch back to the layers tab when clicking Ebenen', () => {
      getTabButton('Einstellungen').click();
      fixture.detectChanges();

      getTabButton('Ebenen').click();
      fixture.detectChanges();

      expect(component.activeTab()).toBe('layers');
    });

    it('should disable the layers tab for a single-layer map', () => {
      activeMapItem.set({
        isSingleLayer: true,
        settings: {
          type: 'gb2Wms',
          layers: [],
          url: '',
          mapId: 'yes',
          isNoticeMarkedAsRead: true,
          [immerable]: true,
        },
        id: '',
        title: '',
        mapImageUrl: null,
        geometadataUuid: null,
        visible: false,
        opacity: 0,
        loadingState: undefined,
        viewProcessState: undefined,
        isTemporary: false,
        addToMap: vi.fn(),
        [immerable]: true,
      });
      fixture.detectChanges();

      const layersButton = getTabButton('Ebenen');

      expect(layersButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('drag and drop', () => {
    it('should pass the disabling of drag&drop down to the header correctly', () => {
      isDragAndDropDisabled.set(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(ActiveMapItemHeaderComponent)).componentInstance.isDragAndDropDisabled()).toBe(true);

      isDragAndDropDisabled.set(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(ActiveMapItemHeaderComponent)).componentInstance.isDragAndDropDisabled()).toBe(false);
    });
  });

  function getTabButton(text: string): HTMLButtonElement {
    const buttons = Array.from(compiled.querySelectorAll<HTMLButtonElement>('.active-map-item__tabs__header__buttons__button'));

    const button = buttons.find((candidate) => candidate.textContent?.trim() === text);

    if (!button) {
      throw new Error(`Could not find tab button "${text}".`);
    }

    return button;
  }
});
