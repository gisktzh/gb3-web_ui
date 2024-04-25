/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {PrintCreation, PrintCreationResponse, PrintMapItem, ReportOrientation} from '../../../interfaces/print.interface';
import {
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
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '../../config.service';
import {BasemapConfigService} from '../../../../map/services/basemap-config.service';
import {Gb3StyledInternalDrawingRepresentation} from '../../../interfaces/internal-drawing-representation.interface';
import {PrintData} from '../../../../map/interfaces/print-data.interface';
import {Gb2WmsSettings} from '../../../../map/models/implementations/gb2-wms.model';
import {DrawingLayerSettings} from '../../../../map/models/implementations/drawing.model';

@Injectable({
  providedIn: 'root',
})
export class Gb3PrintService extends Gb3ApiService {
  protected readonly endpoint = 'print';

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(ConfigService) configService: ConfigService,
    private readonly basemapConfigService: BasemapConfigService,
  ) {
    super(http, configService);
  }

  public createPrintJob(printCreation: PrintCreation): Observable<PrintCreationResponse> {
    const createCreatePayload: PrintNew = this.mapPrintCreationToCreateCreatePayload(printCreation);
    return this.post<PrintNew, PrintCreateData>(this.createCreateUrl(), createCreatePayload).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printLegend(items: PrintableOverlayItem[]): Observable<PrintCreationResponse> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return this.post<PrintLegendNew, PrintLegendCreateData>(this.createPrintLegendUrl(), {legend_topics: items}).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  public printFeatureInfo(items: PrintableOverlayItem[], x: number, y: number): Observable<PrintCreationResponse> {
    return this.post<PrintFeatureInfoNew, PrintFeatureInfoCreateData>(this.createFeatureInfoPrintUrl(), {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      query_topics: items,
      x,
      y,
    }).pipe(
      map((response) => {
        return {reportUrl: response.report_url};
      }),
    );
  }

  /**
   * Creates a PrintCreation object from the given parameters used to create a print job on the print API
   */
  public createPrintCreation(printData: PrintData): PrintCreation {
    const mapItems = this.createPrintCreationMapItems(printData.activeMapItems, printData.activeBasemapId, printData.drawings);
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

  private createPrintLegendUrl(): string {
    return `${this.getFullEndpointUrl()}/legend`;
  }

  private createFeatureInfoPrintUrl(): string {
    return `${this.getFullEndpointUrl()}/feature_info`;
  }

  private createCreateUrl(): string {
    return `${this.getFullEndpointUrl()}`;
  }

  private createPrintCreationMapItems(
    activeMapItems: ActiveMapItem[],
    activeBasemapId: string,
    drawings: Gb3StyledInternalDrawingRepresentation[],
  ): PrintMapItem[] {
    const printMapItems = this.convertActiveMapItemsToPrintMapItems(activeMapItems, drawings);
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
  ): PrintMapItem[] {
    const mapItems: PrintMapItem[] = [];
    activeMapItems
      .filter((activeMapItem) => activeMapItem.visible)
      .forEach((activeMapItem) => {
        switch (activeMapItem.settings.type) {
          case 'drawing':
            mapItems.push(this.createDrawingPrintItem(activeMapItem.settings, drawings));
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
      },
    };
  }

  private createDrawingPrintItem(drawingSettings: DrawingLayerSettings, drawings: Gb3StyledInternalDrawingRepresentation[]): PrintMapItem {
    const drawingsToDraw = drawings.filter((drawing) => drawing.source === drawingSettings.userDrawingLayer);
    return SymbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(drawingsToDraw);
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
                custom_params: mapItem.customParams,
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

  /**
   * Transforms the given layout string (e.g. `A4 hoch`) into size (`A4`) and orientation (`hoch`)
   */
  private transformReportNameToLayoutAndOrientation(name: string): {layout: string; orientation: ReportOrientation | undefined} {
    const report: {layout: string; orientation: ReportOrientation | undefined} = {layout: name, orientation: undefined};
    const splitName = name.split(' ');
    if (splitName.length === 2) {
      const size = splitName[0];
      let orientation: ReportOrientation | undefined;
      switch (splitName[1] as ReportOrientation) {
        case 'portrait':
        case 'landscape':
          orientation = splitName[1] as ReportOrientation;
      }
      if (size && orientation) {
        report.layout = size;
        report.orientation = orientation;
      }
    }
    return report;
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
