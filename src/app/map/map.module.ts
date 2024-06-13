import {CommonModule, NgOptimizedImage} from '@angular/common';
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
import {DataDownloadDialogComponent} from './components/map-tools/data-download-dialog/data-download-dialog.component';
import {FavouriteCreationDialogComponent} from './components/favourite-creation-dialog/favourite-creation-dialog.component';
import {FavouriteDeletionDialogComponent} from './components/favourite-deletion-dialog/favourite-deletion-dialog.component';
import {FeatureInfoContentComponent} from './components/feature-info-overlay/feature-info-content/feature-info-content.component';
import {TableColumnIdentifierDirective} from './components/feature-info-overlay/feature-info-content/table-column-identifier.directive';
import {FeatureInfoGeneralInformationComponent} from './components/feature-info-overlay/feature-info-general-information/feature-info-general-information.component';
import {FeatureInfoItemComponent} from './components/feature-info-overlay/feature-info-item/feature-info-item.component';
import {FeatureInfoOverlayComponent} from './components/feature-info-overlay/feature-info-overlay.component';
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
import {MapRotationButtonComponent} from './components/map-controls/map-rotation-button/map-rotation-button.component';
import {UiToggleComponent} from './components/map-controls/ui-toggle/ui-toggle.component';
import {ZoomControlsComponent} from './components/map-controls/zoom-controls/zoom-controls.component';
import {BaseMapDataItemComponent} from './components/map-data-catalogue/base-map-data-item/base-map-data-item.component';
import {MapDataItemFavouriteComponent} from './components/map-data-catalogue/base-map-data-item/map-data-item-favourite.component';
import {MapDataItemMapComponent} from './components/map-data-catalogue/base-map-data-item/map-data-item-map.component';
import {MapDataCatalogueComponent} from './components/map-data-catalogue/map-data-catalogue.component';
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
import {SearchWindowMobileComponent} from './components/search-window-mobile/search-window-mobile.component';
import {ResultGroupComponent} from './components/search-window/result-groups/result-group/result-group.component';
import {ResultGroupsComponent} from './components/search-window/result-groups/result-groups.component';
import {SearchWindowComponent} from './components/search-window/search-window.component';
import {ShareLinkDialogComponent} from './components/share-link-dialog/share-link-dialog.component';
import {ShareLinkMobileComponent} from './components/share-link-mobile/share-link-mobile.component';
import {TextDrawingToolInputComponent} from './components/text-drawing-tool-input/text-drawing-tool-input.component';
import {TimeSliderComponent} from './components/time-slider/time-slider.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {MapRotationPipe} from './pipes/map-rotation.pipe';
import {DataDownloadSelectMunicipalityDialogComponent} from './components/map-tools/data-download-select-municipality-dialog/data-download-select-municipality-dialog.component';
import {ProductComponent} from './components/map-tools/product/product.component';
import {DataDownloadFilterDialogComponent} from './components/map-tools/data-download-filter-dialog/data-download-filter-dialog.component';
import {DataDownloadEmailDialogComponent} from './components/map-tools/data-download-email-dialog/data-download-email-dialog.component';
import {ElevationProfileOverlayComponent} from './components/elevation-profile-overlay/elevation-profile-overlay.component';
import {ElevationProfileStatisticsComponent} from './components/elevation-profile-overlay/elevation-profile-statistics/elevation-profile-statistics.component';
import {DataDownloadEmailConfirmationDialogComponent} from './components/map-tools/data-download-email-confirmation-dialog/data-download-email-confirmation-dialog.component';
import {DataDownloadStatusQueueComponent} from './components/map-tools/data-download-status-queue/data-download-status-queue.component';
import {DataDownloadOrderStatusPipe} from './pipes/data-download-order-status.pipe';
import {DataDownloadOrderDownloadUrlPipe} from './pipes/data-download-order-download-url.pipe';
import {DrawingSettingsDialogComponent} from './components/map-tools/drawing-settings-dialog/drawing-settings-dialog.component';
import {MapImportDialogComponent} from './components/map-tools/map-import/map-import-dialog/map-import-dialog.component';
import {MapImportServiceAndUrlComponent} from './components/map-tools/map-import/map-import-service-and-url/map-import-service-and-url.component';
import {MapImportLayerListComponent} from './components/map-tools/map-import/map-import-layer-list/map-import-layer-list.component';
import {MapImportDisplayNameComponent} from './components/map-tools/map-import/map-import-display-name/map-import-display-name.component';
import {TimeExtentToStringPipe} from './pipes/time-extent-to-string.pipe';
import {DateToStringPipe} from './pipes/date-to-string.pipe';
import {MapAttributeFilterOverlayComponent} from './components/map-attribute-filter-overlay/map-attribute-filter-overlay.component';
import {DelayedMouseEnterDirective} from '../shared/directives/delayed-mouse-enter.directive';
import {DisableOverscrollBehaviourComponent} from './components/disable-overscroll-behaviour/disable-overscroll-behaviour.component';
import {NotificationIndicatorComponent} from './components/notification-indicator/notification-indicator.component';
import {ElevationProfileChartComponent} from './components/elevation-profile-overlay/elevation-profile-chart/elevation-profile-chart.component';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {FeatureFlagDirective} from '../shared/directives/feature-flag.directive';
import {DrawingDownloadButtonComponent} from './components/map-tools/drawing-download-button/drawing-download-button.component';
import {DrawingsImportDialogComponent} from './components/map-tools/drawings-import-dialog/drawings-import-dialog.component';
import {DropZoneComponent} from '../shared/components/drop-zone/drop-zone.component';

@NgModule({
  providers: [provideCharts(withDefaultRegisterables())],
  declarations: [
    MapPageComponent,
    MapContainerComponent,
    ActiveMapItemsComponent,
    ActiveMapItemComponent,
    LegendOverlayComponent,
    LegendItemComponent,
    FeatureInfoOverlayComponent,
    MapDataCatalogueComponent,
    MapOverlayListItemComponent,
    FeatureInfoItemComponent,
    CoordinateScaleInputsComponent,
    MapControlsComponent,
    BasemapSelectorComponent,
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
    TableColumnIdentifierDirective,
    BaseMapDataItemComponent,
    MapDataItemMapComponent,
    MapDataItemFavouriteComponent,
    MapDataItemMapLayerComponent,
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
    BasemapSelectionListComponent,
    MapToolsDesktopComponent,
    MapToolsMobileComponent,
    UiToggleComponent,
    TextDrawingToolInputComponent,
    SearchWindowMobileComponent,
    ShareLinkMobileComponent,
    MapRotationButtonComponent,
    MapRotationPipe,
    DataDownloadSelectMunicipalityDialogComponent,
    ProductComponent,
    DataDownloadFilterDialogComponent,
    DataDownloadEmailDialogComponent,
    ElevationProfileOverlayComponent,
    ElevationProfileStatisticsComponent,
    DataDownloadEmailConfirmationDialogComponent,
    DataDownloadStatusQueueComponent,
    DataDownloadOrderStatusPipe,
    DataDownloadOrderDownloadUrlPipe,
    DrawingSettingsDialogComponent,
    MapImportDialogComponent,
    DrawingsImportDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MapRoutingModule,
    OnboardingGuideModule,
    FormsModule,
    ReactiveFormsModule,
    MapImportServiceAndUrlComponent,
    MapImportLayerListComponent,
    MapImportDisplayNameComponent,
    TimeExtentToStringPipe,
    DateToStringPipe,
    MapOverlayComponent,
    MapAttributeFilterComponent,
    MapAttributeFilterOverlayComponent,
    DelayedMouseEnterDirective,
    DisableOverscrollBehaviourComponent,
    NotificationIndicatorComponent,
    ElevationProfileChartComponent,
    DrawingDownloadButtonComponent,
    FeatureFlagDirective,
    NgOptimizedImage,
    DropZoneComponent,
  ],
  exports: [LegendOverlayComponent, FeatureInfoOverlayComponent, MapContainerComponent, ZoomControlsComponent, MapOverlayComponent],
})
export class MapModule {}
