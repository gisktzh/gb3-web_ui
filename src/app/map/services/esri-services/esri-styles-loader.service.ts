import {DOCUMENT, inject, Injectable} from '@angular/core';

/**
 * Lazily loads the ArcGIS theme stylesheet (`@arcgis/core/assets/esri/themes/light/main.css`).
 *
 * This stylesheet is ~340kb and contains CSS for every ArcGIS widget (Legend, BasemapGallery,
 * Editor, Popup, TimeSlider, Calcite components, etc.), most of which this app never uses (it only
 * uses `SketchViewModel` headlessly and a custom Angular UI). Previously it was imported globally
 * in `styles.scss`, which meant it was downloaded and parsed on every single page - including pages
 * that never show a map - hurting FCP/LCP (Lighthouse "Reduce unused CSS").
 *
 * Instead, it is copied as a static asset (see the `assets` config in `angular.json`, "esri-theme")
 * and injected into the document on demand, only by components that actually render a map
 * (see `MapContainerComponent`).
 */
@Injectable({
  providedIn: 'root',
})
export class EsriStylesLoaderService {
  private static readonly STYLESHEET_ID = 'esri-theme-stylesheet';
  private static readonly STYLESHEET_HREF = 'assets/esri-theme/light/main.css';

  private readonly document = inject(DOCUMENT);
  private loadPromise: Promise<void> | undefined;

  /**
   * Ensures the ArcGIS theme stylesheet is present in the document. Safe to call multiple times
   * (e.g. on every map component instantiation) - the stylesheet is only ever added once.
   */
  public ensureLoaded(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    const existingLink = this.document.getElementById(EsriStylesLoaderService.STYLESHEET_ID);
    if (existingLink) {
      this.loadPromise = Promise.resolve();
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const link = this.document.createElement('link');
      link.id = EsriStylesLoaderService.STYLESHEET_ID;
      link.rel = 'stylesheet';
      link.href = EsriStylesLoaderService.STYLESHEET_HREF;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Could not load ArcGIS theme stylesheet from ${EsriStylesLoaderService.STYLESHEET_HREF}`));
      this.document.head.appendChild(link);
    });

    return this.loadPromise;
  }
}
