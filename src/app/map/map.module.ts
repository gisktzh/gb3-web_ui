import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {ActiveMapItemsWidgetComponent} from './components/active-map-items-widget/active-map-items-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {LegendWidgetComponent} from './components/legend-widget/legend-widget.component';
import {LegendItemComponent} from './components/legend-widget/legend-item/legend-item.component';
import {FeatureInfoComponent} from './components/feature-info/feature-info.component';
import {MapDataCatalogueComponent} from './components/map-data-catalogue/map-data-catalogue.component';
import {MapOverlayComponent} from './components/map/map-overlay/map-overlay.component';
import {MapOverlayListItemComponent} from './components/map/map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {FeatureInfoItemComponent} from './components/feature-info/feature-info-item/feature-info-item.component';
import {PrintOverlayComponent} from './components/print-overlay/print-overlay.component';
import {PrintDispatcherComponent} from './components/print-overlay/print-dispatcher/print-dispatcher.component';
import {ScaleInputComponent} from './components/map/scale-input/scale-input.component';
import {MapControlsComponent} from './components/map/map-controls/map-controls.component';
import {BasemapSelectorComponent} from './components/map/basemap-selector/basemap-selector.component';
import {ActiveMapItemComponent} from './components/active-map-items-widget/active-map-item/active-map-item.component';
import {OnboardingGuideModule} from '../onboarding-guide/onboarding-guide.module';
import {FavouriteDialogComponent} from './components/favourite-dialog/favourite-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FavouriteSelectionComponent} from './components/map-data-catalogue/favourite-selection/favourite-selection.component';

@NgModule({
  declarations: [
    MapPageComponent,
    MapComponent,
    ActiveMapItemsWidgetComponent,
    ActiveMapItemComponent,
    LegendWidgetComponent,
    LegendItemComponent,
    FeatureInfoComponent,
    MapOverlayComponent,
    MapDataCatalogueComponent,
    MapOverlayListItemComponent,
    FeatureInfoItemComponent,
    PrintOverlayComponent,
    PrintDispatcherComponent,
    ScaleInputComponent,
    MapControlsComponent,
    BasemapSelectorComponent,
    FavouriteDialogComponent,
    FavouriteSelectionComponent
  ],
  imports: [CommonModule, SharedModule, MapRoutingModule, OnboardingGuideModule, FormsModule, ReactiveFormsModule]
})
export class MapModule {}
