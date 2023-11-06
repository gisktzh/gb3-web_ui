import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {OnboardingGuideModule} from '../onboarding-guide/onboarding-guide.module';
import {SharedModule} from '../shared/shared.module';
import {ActiveMapItemHeaderComponent} from './components/active-map-items/active-map-item-header/active-map-item-header.component';
import {ActiveMapItemLayerComponent} from './components/active-map-items/active-map-item-layers/active-map-item-layer/active-map-item-layer.component';
import {ActiveMapItemLayersComponent} from './components/active-map-items/active-map-item-layers/active-map-item-layers.component';
import {ActiveMapItemSettingsComponent} from './components/active-map-items/active-map-item-settings/active-map-item-settings.component';
import {ActiveMapItemComponent} from './components/active-map-items/active-map-item/active-map-item.component';
import {ActiveMapItemsComponent} from './components/active-map-items/active-map-items.component';
import {ApiDialogWrapperComponent} from './components/api-dialog-wrapper/api-dialog-wrapper.component';
import {BottomSheetItemComponent} from './components/bottom-sheet-overlay/bottom-sheet-item/bottom-sheet-item.component';
import {BottomSheetOverlayComponent} from './components/bottom-sheet-overlay/bottom-sheet-overlay.component';
import {DataDownloadSelectMunicipalityDialogComponent} from './components/data-download-select-municipality-dialog/data-download-select-municipality-dialog.component';
import {DataDownloadDialogComponent} from './components/data-download/data-download-dialog/data-download-dialog.component';
import {FavouriteCreationDialogComponent} from './components/favourite-creation-dialog/favourite-creation-dialog.component';
import {FavouriteDeletionDialogComponent} from './components/favourite-deletion-dialog/favourite-deletion-dialog.component';
import {FeatureInfoContentComponent} from './components/feature-info-overlay/feature-info-content/feature-info-content.component';
import {TableColumnIdentifierDirective} from './components/feature-info-overlay/feature-info-content/table-column-identifier.directive';
import {FeatureInfoGeneralInformationComponent} from './components/feature-info-overlay/feature-info-general-information/feature-info-general-information.component';
import {FeatureInfoItemComponent} from './components/feature-info-overlay/feature-info-item/feature-info-item.component';
import {FeatureInfoOverlayComponent} from './components/feature-info-overlay/feature-info-overlay.component';
import {FeatureInfoPrintContentComponent} from './components/feature-info-overlay/feature-info-print-content/feature-info-print-content.component';
import {FeatureInfoComponent} from './components/feature-info-overlay/feature-info/feature-info.component';
import {LegendContentComponent} from './components/legend-overlay/legend-content/legend-content.component';
import {LegendItemComponent} from './components/legend-overlay/legend-item/legend-item.component';
import {LegendOverlayComponent} from './components/legend-overlay/legend-overlay.component';
import {LegendComponent} from './components/legend-overlay/legend/legend.component';
import {MapAttributeFilterComponent} from './components/map-attribute-filter/map-attribute-filter.component';
import {MapContainerComponent} from './components/map-container/map-container.component';
import {BasemapSelectionListComponent} from './components/map-controls/basemap-selector/basemap-selection-list/basemap-selection-list.component';
import {BasemapSelectorComponent} from './components/map-controls/basemap-selector/basemap-selector.component';
import {CoordinateScaleInputsComponent} from './components/map-controls/coordinate-scale-inputs/coordinate-scale-inputs.component';
import {DataInputComponent} from './components/map-controls/data-input/data-input.component';
import {MapControlsComponent} from './components/map-controls/map-controls.component';
import {UiToggleComponent} from './components/map-controls/ui-toggle/ui-toggle.component';
import {ZoomControlsComponent} from './components/map-controls/zoom-controls/zoom-controls.component';
import {BaseMapDataItemComponent} from './components/map-data-catalogue/base-map-data-item/base-map-data-item.component';
import {MapDataItemFavouriteComponent} from './components/map-data-catalogue/base-map-data-item/map-data-item-favourite.component';
import {MapDataItemMapComponent} from './components/map-data-catalogue/base-map-data-item/map-data-item-map.component';
import {MapDataCatalogueComponent} from './components/map-data-catalogue/map-data-catalogue.component';
import {MapDataItemHeaderComponent} from './components/map-data-catalogue/map-data-item-header/map-data-item-header.component';
import {MapDataItemMapLayerComponent} from './components/map-data-catalogue/map-data-item-map-layer/map-data-item-map-layer.component';
import {MapManagementMobileComponent} from './components/map-management-mobile/map-management-mobile.component';
import {MapNoticeDialogComponent} from './components/map-notice-dialog/map-notice-dialog.component';
import {MapOverlayListItemComponent} from './components/map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MapOverlayComponent} from './components/map-overlay/map-overlay.component';
import {AbstractToolsComponent} from './components/map-tools/abstract-tools/abstract-tools.component';
import {DataDownloadSelectionToolsComponent} from './components/map-tools/data-download-selection-tools/data-download-selection-tools.component';
import {DrawingToolsComponent} from './components/map-tools/drawing-tools/drawing-tools.component';
import {MapToolsDesktopComponent} from './components/map-tools/map-tools-desktop/map-tools-desktop.component';
import {MapToolsMobileComponent} from './components/map-tools/map-tools-mobile/map-tools-mobile.component';
import {MapToolsComponent} from './components/map-tools/map-tools.component';
import {MeasurementToolsComponent} from './components/map-tools/measurement-tools/measurement-tools.component';
import {PrintDialogComponent} from './components/map-tools/print-dialog/print-dialog.component';
import {PrintDispatcherComponent} from './components/print-overlay/print-dispatcher/print-dispatcher.component';
import {PrintOverlayComponent} from './components/print-overlay/print-overlay.component';
import {ResultGroupComponent} from './components/search-window/result-groups/result-group/result-group.component';
import {ResultGroupsComponent} from './components/search-window/result-groups/result-groups.component';
import {SearchWindowComponent} from './components/search-window/search-window.component';
import {ShareLinkContentComponent} from './components/share-link-dialog/share-link-content/share-link-content.component';
import {ShareLinkDialogComponent} from './components/share-link-dialog/share-link-dialog.component';
import {TimeSliderComponent} from './components/time-slider/time-slider.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {TextDrawingToolInputComponent} from './components/text-drawing-tool-input/text-drawing-tool-input.component';

@NgModule({
  declarations: [
    MapPageComponent,
    MapContainerComponent,
    ActiveMapItemsComponent,
    ActiveMapItemComponent,
    LegendOverlayComponent,
    LegendItemComponent,
    FeatureInfoOverlayComponent,
    MapOverlayComponent,
    MapDataCatalogueComponent,
    MapOverlayListItemComponent,
    FeatureInfoItemComponent,
    PrintOverlayComponent,
    PrintDispatcherComponent,
    CoordinateScaleInputsComponent,
    MapControlsComponent,
    BasemapSelectorComponent,
    MapAttributeFilterComponent,
    SearchWindowComponent,
    FavouriteCreationDialogComponent,
    ApiDialogWrapperComponent,
    FavouriteDeletionDialogComponent,
    TimeSliderComponent,
    LegendContentComponent,
    FeatureInfoContentComponent,
    ResultGroupsComponent,
    ResultGroupComponent,
    ActiveMapItemHeaderComponent,
    ActiveMapItemSettingsComponent,
    ActiveMapItemLayersComponent,
    ActiveMapItemLayerComponent,
    FeatureInfoContentComponent,
    FeatureInfoPrintContentComponent,
    TableColumnIdentifierDirective,
    BaseMapDataItemComponent,
    MapDataItemMapComponent,
    MapDataItemFavouriteComponent,
    MapDataItemMapLayerComponent,
    MapDataItemHeaderComponent,
    DataInputComponent,
    MapNoticeDialogComponent,
    FeatureInfoGeneralInformationComponent,
    MapToolsComponent,
    PrintDialogComponent,
    ShareLinkDialogComponent,
    MeasurementToolsComponent,
    DrawingToolsComponent,
    AbstractToolsComponent,
    ZoomControlsComponent,
    DataDownloadSelectionToolsComponent,
    DataDownloadDialogComponent,
    BottomSheetOverlayComponent,
    BottomSheetItemComponent,
    LegendComponent,
    MapManagementMobileComponent,
    FeatureInfoComponent,
    ShareLinkContentComponent,
    BasemapSelectionListComponent,
    MapToolsDesktopComponent,
    MapToolsMobileComponent,
    DataDownloadSelectMunicipalityDialogComponent,
    UiToggleComponent,
    TextDrawingToolInputComponent,
  ],
  imports: [CommonModule, SharedModule, MapRoutingModule, OnboardingGuideModule, FormsModule, ReactiveFormsModule],
  exports: [LegendOverlayComponent, FeatureInfoOverlayComponent, MapContainerComponent, ZoomControlsComponent],
})
export class MapModule {}
