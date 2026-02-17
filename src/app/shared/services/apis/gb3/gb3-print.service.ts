/* eslint-disable @typescript-eslint/naming-convention -- mapping service to API */
import {inject, Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {map, Observable} from 'rxjs';
import {
  DynamicStringParameters,
  PrintCreation,
  PrintCreationResponse,
  PrintMapItem,
  ReportOrientation,
} from '../../../interfaces/print.interface';
import {
  PrintCapabilities,
  PrintCreateData,
  PrintFeatureInfoCreateData,
  PrintFeatureInfoNew,
  PrintLegendCreateData,
  PrintLegendNew,
  PrintNew,
} from '../../../models/gb3-api-generated.interfaces';
import {PrintableOverlayItem} from '../../../interfaces/overlay-print.interface';
import {SymbolizationToGb3ConverterUtils} from '../../../utils/symbolization-to-gb3-converter.utils';
import {ActiveMapItem} from '../../../../map/models/active-map-item.model';
import {BasemapConfigService} from '../../../../map/services/basemap-config.service';
import {Gb3StyledInternalDrawingRepresentation} from '../../../interfaces/internal-drawing-representation.interface';
import {PrintData} from '../../../../map/interfaces/print-data.interface';
import {Gb2WmsSettings} from '../../../../map/models/implementations/gb2-wms.model';
import {DrawingLayerSettings} from '../../../../map/models/implementations/drawing.model';
import {Gb3TopicsService} from './gb3-topics.service';
import {TimeSliderParameterSource} from '../../../interfaces/topic.interface';
import {DocumentFormat} from 'src/app/shared/interfaces/print-rules.interface';
import {printConfig} from 'src/app/shared/configs/print.config';

@Injectable({
  providedIn: 'root',
})
export class Gb3PrintService extends Gb3ApiService {
  private readonly basemapConfigService = inject(BasemapConfigService);
  private readonly gb3TopicsService = inject(Gb3TopicsService);
  private readonly symbolizationToGb3ConverterUtils = inject(SymbolizationToGb3ConverterUtils);

  protected readonly endpoint = 'print';

  public createPrintJob(printCreation: PrintCreation): Observable<PrintCreationResponse> {
    const createCreatePayload: PrintNew = this.mapPrintCreationToCreateCreatePayload(printCreation);
    return this.post<PrintNew, PrintCreateData>(this.createCreateUrl(), createCreatePayload).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printLegend(items: PrintableOverlayItem[]): Observable<PrintCreationResponse> {
    return this.post<PrintLegendNew, PrintLegendCreateData>(this.createPrintLegendUrl(), {legend_topics: items}).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printFeatureInfo(items: PrintableOverlayItem[], x: number, y: number): Observable<PrintCreationResponse> {
    return this.post<PrintFeatureInfoNew, PrintFeatureInfoCreateData>(this.createFeatureInfoPrintUrl(), {
      query_topics: items,
      x,
      y,
    }).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public fetchPrintCapabilities(): Observable<PrintCapabilities> {
    return this.get(this.printCapabilitiesUrl());
  }

  /**
   * Creates a PrintCreation object from the given parameters used to create a print job on the print API
   */
  public createPrintCreation(printData: PrintData): PrintCreation {
    const mapItems = this.createPrintCreationMapItems(
      printData.activeMapItems,
      printData.activeBasemapId,
      printData.drawings,
      printData.mapScale,
      printData.scale,
      this.getReportSizing(printData.reportLayout, printData.reportOrientation),
    );
    const reportTitle = mapItems
      .map((mapItem) => (mapItem.type === 'WMS' && !mapItem.background ? mapItem.mapTitle : undefined))
      .filter((mapItemTitle): mapItemTitle is string => !!mapItemTitle)
      .join(', ');
    return {
      format: printData.format,
      reportLayout: printData.reportLayout,
      reportType: printData.reportType,
      reportOrientation: printData.reportOrientation,
      attributes: {
        reportTitle,
        userTitle: printData.title,
        userComment: printData.comment,
        showLegend: printData.showLegend,
      },
      map: {
        scale: printData.scale,
        dpi: printData.dpi,
        center: [printData.mapCenter.x, printData.mapCenter.y],
        rotation: printData.rotation,
        mapItems,
      },
    };
  }

  public getReportSizing(layout: string | null | undefined, reportOrientation: ReportOrientation | null | undefined) {
    const defaultDocumentFormat = DocumentFormat[printConfig.defaultPrintValues.documentFormat] as keyof typeof DocumentFormat;
    let currentReportSizing = printConfig.pixelSizes[defaultDocumentFormat].landscape;

    if (layout) {
      const documentFormat = printConfig.pixelSizes[layout as keyof typeof DocumentFormat];
      if (reportOrientation === 'landscape') {
        currentReportSizing = documentFormat.landscape;
      } else {
        currentReportSizing = documentFormat.portrait;
      }
    }

    return currentReportSizing;
  }

  private createPrintLegendUrl(): string {
    return `${this.getFullEndpointUrl()}/legend`;
  }

  private createFeatureInfoPrintUrl(): string {
    return `${this.getFullEndpointUrl()}/feature_info`;
  }

  private printCapabilitiesUrl(): string {
    return `${this.getFullEndpointUrl()}/capabilities`;
  }

  private createCreateUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  private createPrintCreationMapItems(
    activeMapItems: ActiveMapItem[],
    activeBasemapId: string,
    drawings: Gb3StyledInternalDrawingRepresentation[],
    mapScale: number,
    printScale: number,
    reportSizing: {width: number; height: number},
  ): PrintMapItem[] {
    const printMapItems = this.convertActiveMapItemsToPrintMapItems(activeMapItems, drawings, mapScale, printScale, reportSizing);
    const printBasemapItem = this.convertActiveBaseMapToPrintMapItem(activeBasemapId);
    if (printBasemapItem) {
      printMapItems.push(printBasemapItem);
    }
    // reverse the order as the print API uses an inverse positioning to draw them (lowest index has lowest visibility)
    return printMapItems.reverse();
  }

  private convertActiveMapItemsToPrintMapItems(
    activeMapItems: ActiveMapItem[],
    drawings: Gb3StyledInternalDrawingRepresentation[],
    mapScale: number,
    printScale: number,
    reportSizing: {width: number; height: number},
  ): PrintMapItem[] {
    const mapItems: PrintMapItem[] = [];
    activeMapItems
      .filter((activeMapItem) => activeMapItem.visible)
      .forEach((activeMapItem) => {
        switch (activeMapItem.settings.type) {
          case 'drawing':
            mapItems.push(this.createDrawingPrintItem(activeMapItem.settings, drawings, printScale, mapScale, reportSizing));
            break;
          case 'gb2Wms':
            mapItems.push(this.createGb2WmsPrintItem(activeMapItem, activeMapItem.settings));
            break;
          case 'externalService':
            // we do not print external map services
            break;
        }
      });
    return mapItems;
  }

  private convertActiveBaseMapToPrintMapItem(activeBasemapId: string): PrintMapItem | undefined {
    let activeBasemapPrintItem: PrintMapItem | undefined;

    // add basemap
    const activeBasemap = this.basemapConfigService.availableBasemaps.find((basemap) => basemap.id === activeBasemapId);
    if (activeBasemap) {
      switch (activeBasemap.type) {
        case 'blank':
          // a blank basemap does not have to be printed
          break;
        case 'wms':
          activeBasemapPrintItem = {
            layers: activeBasemap.layers.map((layer) => layer.name),
            type: 'WMS',
            opacity: 1,
            url: activeBasemap.url,
            mapTitle: activeBasemap.title,
            background: true,
          };
          break;
      }
    }

    return activeBasemapPrintItem;
  }

  private createGb2WmsPrintItem(activeMapItem: ActiveMapItem, gb2WmsSettings: Gb2WmsSettings): PrintMapItem {
    const dynamicStringParameters: DynamicStringParameters = {};
    if (gb2WmsSettings.filterConfigurations) {
      const attributeFilterParameters = this.gb3TopicsService.transformFilterConfigurationToParameters(gb2WmsSettings.filterConfigurations);
      attributeFilterParameters.forEach((filterParameter) => {
        dynamicStringParameters[filterParameter.name] = filterParameter.value;
      });
    }
    if (gb2WmsSettings.timeSliderConfiguration && gb2WmsSettings.timeSliderExtent) {
      switch (gb2WmsSettings.timeSliderConfiguration.sourceType) {
        case 'parameter': {
          const timeSliderParameterSource = gb2WmsSettings.timeSliderConfiguration.source as TimeSliderParameterSource;
          const dateFormat = gb2WmsSettings.timeSliderConfiguration.dateFormat;

          dynamicStringParameters[timeSliderParameterSource.startRangeParameter] = this.timeService.getDateAsUTCString(
            gb2WmsSettings.timeSliderExtent.start,
            dateFormat,
          );
          dynamicStringParameters[timeSliderParameterSource.endRangeParameter] = this.timeService.getDateAsUTCString(
            gb2WmsSettings.timeSliderExtent.end,
            dateFormat,
          );
          break;
        }
        case 'layer':
          // This already works as is as we are printing the visible layers already
          break;
      }
    }
    return {
      // order matters: the lowest index has the highest visibility
      layers: gb2WmsSettings.layers
        .filter((layer) => layer.visible)
        .map((layer) => layer.layer)
        .reverse(), // reverse the order of the sublayers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the print API specs
      type: 'WMS',
      opacity: activeMapItem.opacity,
      url: gb2WmsSettings.url,
      mapTitle: activeMapItem.title,
      customParams: {
        format: this.configService.gb2Config.wmsFormatMimeType,
        transparent: true, // always true
        dynamicStringParams: dynamicStringParameters,
      },
    };
  }

  private createDrawingPrintItem(
    drawingSettings: DrawingLayerSettings,
    drawings: Gb3StyledInternalDrawingRepresentation[],
    printScale: number,
    mapScale: number,
    reportSizing: {width: number; height: number},
  ): PrintMapItem {
    const drawingsToDraw = drawings.filter((drawing) => drawing.source === drawingSettings.userDrawingLayer);

    return this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(
      drawingsToDraw,
      mapScale,
      printScale,
      reportSizing,
    );
  }

  private mapPrintCreationToCreateCreatePayload(printCreation: PrintCreation): PrintNew {
    return {
      report: this.transformSizeAndOrientationToLayoutName(
        printCreation.reportLayout,
        printCreation.reportOrientation,
        printCreation.reportType,
      ),
      format: printCreation.format,
      map: {
        dpi: printCreation.map.dpi,
        rotation: printCreation.map.rotation,
        center: printCreation.map.center,
        scale: printCreation.map.scale,
        layers: printCreation.map.mapItems.map((mapItem) => {
          switch (mapItem.type) {
            case 'Vector':
              return {
                type: 'Vector',
                geojson: mapItem.geojson,
                styles: mapItem.styles,
              };
            case 'WMS':
              return {
                type: 'WMS',
                url: mapItem.url,
                layers: mapItem.layers,
                custom_params: mapItem.customParams
                  ? {
                      format: mapItem.customParams.format,
                      transparent: mapItem.customParams.transparent,
                      ...mapItem.customParams.dynamicStringParams,
                    }
                  : undefined,
                opacity: mapItem.opacity,
                map_title: mapItem.mapTitle,
                background: mapItem.background,
              };
          }
        }),
      },
      attributes: {
        report_title: printCreation.attributes.reportTitle,
        show_legend: printCreation.attributes.showLegend,
        user_comment: printCreation.attributes.userComment,
        user_title: printCreation.attributes.userTitle,
      },
    };
  }

  private transformSizeAndOrientationToLayoutName(size: string, orientation: ReportOrientation | undefined, reportType: string): string {
    if (reportType === 'mapset') {
      return 'Kartenset';
    }
    if (!orientation) {
      return size;
    }
    return `${size} ${orientation === 'portrait' ? 'hoch' : 'quer'}`;
  }
}
