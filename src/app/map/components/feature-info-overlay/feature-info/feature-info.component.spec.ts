import {Component, input, inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectFeatureInfoQueryLoadingState} from 'src/app/state/map/selectors/feature-info-query-loading-state.selector';
import {selectFeatureInfosForDisplay} from '../../../../state/map/selectors/feature-info-result-display.selector';
import {selectData} from '../../../../state/map/reducers/general-info.reducer';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {FeatureInfoComponent} from './feature-info.component';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {FeatureInfoGeneralInformationComponent} from '../feature-info-general-information/feature-info-general-information.component';
import {FeatureInfoItemComponent} from '../feature-info-item/feature-info-item.component';
import {GeneralInfoResponse} from 'src/app/shared/interfaces/general-info.interface';

@Component({
  selector: 'loading-and-process-bar',
  standalone: true,
  template: '',
})
class MockLoadingAndProcessBarComponent {
  public readonly loadingState = input<unknown>();
}

@Component({
  selector: 'feature-info-general-information',
  standalone: true,
  template: '',
})
class MockFeatureInfoGeneralInformationComponent {
  public readonly generalInfoData = input<unknown>();
}

@Component({
  selector: 'feature-info-item',
  standalone: true,
  template: '',
})
class MockFeatureInfoItemComponent {
  public readonly featureInfo = input<unknown>();
  public readonly showInteractiveElements = input<boolean>();
}

describe('FeatureInfoComponent', () => {
  let component: FeatureInfoComponent;
  let fixture: ComponentFixture<FeatureInfoComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const showInteractiveElements = signal(true);

  const createFeatureInfo = (id: string): FeatureInfoResultDisplay =>
    ({
      id,
    }) as FeatureInfoResultDisplay;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureInfoComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(FeatureInfoComponent, {
        remove: {
          imports: [LoadingAndProcessBarComponent, FeatureInfoGeneralInformationComponent, FeatureInfoItemComponent],
        },
        add: {
          imports: [MockLoadingAndProcessBarComponent, MockFeatureInfoGeneralInformationComponent, MockFeatureInfoItemComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, undefined);
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.overrideSelector(selectData, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(FeatureInfoComponent, {
      bindings: [inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the loading state', () => {
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loading');
    store.refreshState();
    fixture.detectChanges();

    const loadingBar = fixture.debugElement.query((element) => element.componentInstance instanceof MockLoadingAndProcessBarComponent)
      .componentInstance as MockLoadingAndProcessBarComponent;

    expect(loadingBar.loadingState()).toBe('loading');
  });

  it('should render general information when data is available and loading is complete', () => {
    const generalInfoData: GeneralInfoResponse = {
      locationInformation: {
        queryPosition: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        heightDom: 0,
        heightDtm: 0,
      },
      alternativeSpatialReferences: [],
      externalMaps: [],
    };

    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectData, generalInfoData);
    store.refreshState();
    fixture.detectChanges();

    const generalInfo = fixture.debugElement.query(
      (element) => element.componentInstance instanceof MockFeatureInfoGeneralInformationComponent,
    ).componentInstance as MockFeatureInfoGeneralInformationComponent;

    expect(generalInfo.generalInfoData()).toBe(generalInfoData);
    expect(compiled.querySelector('mat-divider')).toBeTruthy();
  });

  it('should not render general information when no data is available', () => {
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectData, undefined);
    fixture.detectChanges();

    expect(
      fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoGeneralInformationComponent),
    ).toBeNull();

    expect(compiled.querySelector('mat-divider')).toBeNull();
  });

  it('should render feature info items when data is available', () => {
    const firstFeature = createFeatureInfo('first');
    const secondFeature = createFeatureInfo('second');

    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectFeatureInfosForDisplay, [firstFeature, secondFeature]);
    store.refreshState();
    fixture.detectChanges();

    const featureItems = fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockFeatureInfoItemComponent);

    expect(featureItems).toHaveLength(2);
  });

  it('should pass feature info data to each feature info item', () => {
    const firstFeature = createFeatureInfo('first');
    const secondFeature = createFeatureInfo('second');

    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectFeatureInfosForDisplay, [firstFeature, secondFeature]);
    store.refreshState();
    fixture.detectChanges();

    const featureItems = fixture.debugElement.queryAll((element) => element.componentInstance instanceof MockFeatureInfoItemComponent);

    const firstItem = featureItems[0].componentInstance as MockFeatureInfoItemComponent;
    const secondItem = featureItems[1].componentInstance as MockFeatureInfoItemComponent;

    expect(firstItem.featureInfo()).toBe(firstFeature);
    expect(secondItem.featureInfo()).toBe(secondFeature);
  });

  it('should pass showInteractiveElements to feature info items', () => {
    const feature = createFeatureInfo('first');

    showInteractiveElements.set(false);
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectFeatureInfosForDisplay, [feature]);
    store.refreshState();
    fixture.detectChanges();

    const featureItem = fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoItemComponent)
      .componentInstance as MockFeatureInfoItemComponent;

    expect(featureItem.showInteractiveElements()).toBe(false);
  });

  it('should render no-results message when loaded with no feature info', () => {
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loaded');
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Keine kartenspezifischen Treffer!');
  });

  it('should not render no-results message while loading', () => {
    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loading');
    store.overrideSelector(selectFeatureInfosForDisplay, []);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('Keine kartenspezifischen Treffer!');
  });

  it('should not render loaded content while loading', () => {
    const feature = createFeatureInfo('first');
    const generalInfoData: GeneralInfoResponse = {
      locationInformation: {
        queryPosition: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        heightDom: 0,
        heightDtm: 0,
      },
      alternativeSpatialReferences: [],
      externalMaps: [],
    };

    store.overrideSelector(selectFeatureInfoQueryLoadingState, 'loading');
    store.overrideSelector(selectFeatureInfosForDisplay, [feature]);
    store.overrideSelector(selectData, generalInfoData);
    store.refreshState();
    fixture.detectChanges();

    expect(
      fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoGeneralInformationComponent),
    ).toBeNull();

    expect(fixture.debugElement.query((element) => element.componentInstance instanceof MockFeatureInfoItemComponent)).toBeNull();

    expect(compiled.textContent).not.toContain('Keine kartenspezifischen Treffer!');
  });

  it('should return the feature info id from trackById', () => {
    const feature = createFeatureInfo('feature-123');

    expect(component.trackById(0, feature)).toBe('feature-123');
  });
});
