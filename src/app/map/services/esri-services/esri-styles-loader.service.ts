import {DOCUMENT, inject, Injectable} from '@angular/core';

/**
 * Loads the ArcGIS theme for the ArcGIS map implementation. Angular copies the
 * theme and its relative assets via the esri-theme asset entries in angular.json.
 * The stylesheet remains cached in the document across map visits.
 */
@Injectable({providedIn: 'root'})
export class EsriStylesLoaderService {
  private static readonly STYLESHEET_ID = 'esri-theme-stylesheet';
  private static readonly STYLESHEET_HREF = 'assets/esri-theme/light/main.css';

  private readonly document = inject(DOCUMENT);
  private loadPromise: Promise<void> | undefined;

  public ensureLoaded(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    const existingLink = this.document.getElementById(EsriStylesLoaderService.STYLESHEET_ID) as HTMLLinkElement | null;
    if (existingLink?.sheet || existingLink?.dataset['loaded'] === 'true') {
      return (this.loadPromise = Promise.resolve());
    }

    const link = existingLink ?? this.document.createElement('link');
    this.loadPromise = new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        link.removeEventListener('load', onLoad);
        link.removeEventListener('error', onError);
      };
      const onLoad = () => {
        cleanup();
        link.dataset['loaded'] = 'true';
        resolve();
      };
      const onError = () => {
        cleanup();
        link.remove();
        this.loadPromise = undefined;
        reject(new Error(`Could not load ArcGIS theme stylesheet from ${EsriStylesLoaderService.STYLESHEET_HREF}`));
      };
      link.addEventListener('load', onLoad);
      link.addEventListener('error', onError);

      if (!existingLink) {
        link.id = EsriStylesLoaderService.STYLESHEET_ID;
        link.rel = 'stylesheet';
        link.href = EsriStylesLoaderService.STYLESHEET_HREF;
        this.document.head.appendChild(link);
      }
    });
    return this.loadPromise;
  }
}
