import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {LoadingState} from '../types/loading-state';
import {ConfigService} from './config.service';

interface InjectableExternalScript {
  src: string;
  type: string;
  id: string;
}

interface InjectedExternalScript extends InjectableExternalScript {
  scriptReference: HTMLScriptElement;
}

@Injectable({
  providedIn: 'root'
})
export class ScriptInjectorService {
  private readonly loadedScripts: InjectedExternalScript[] = [];
  private readonly renderer: Renderer2;
  private readonly twitterFeedInjectableScript: InjectableExternalScript = {
    id: 'twitter-feed',
    type: 'text/javascript',
    src: this.configService.apiConfig.twitterWidget.baseUrl
  };

  constructor(private readonly rendererFactory: RendererFactory2, private readonly configService: ConfigService) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Injects the twitterfeed API and returns the (global) twttr API object. Gracefully awaits the onload event and also handles errors like
   * wrong URLs or CDN failures.
   *
   * For more details: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/overview
   */
  public injectTwitterFeedApi(): Observable<TwitterLike> {
    const scriptLoadingState = new BehaviorSubject<LoadingState>('loading');

    const injectScript = this.injectExternalScript(this.twitterFeedInjectableScript).pipe(
      tap((script) => {
        if (typeof twttr !== 'undefined') {
          scriptLoadingState.next('loaded');
        } else if (this.loadedScripts.find((loadedScript) => loadedScript.id === script.id)) {
          scriptLoadingState.next('error');
        } else {
          script.onload = () => {
            scriptLoadingState.next('loaded');
          };
          script.onerror = () => {
            scriptLoadingState.next('error');
          };
        }
      })
    );

    return combineLatest([scriptLoadingState, injectScript]).pipe(
      filter(([isLoaded, _]) => isLoaded !== 'loading'),
      map(([isLoaded, _]) => {
        if (isLoaded === 'error') {
          throw new Error('Error loading twitter feed.'); // todo: add error classes for overall app
        }
        return twttr;
      })
    );
  }

  /**
   * Loads a script from an external source and injects it to the DOM. Keeps track of already added scripts and returns the cached instance
   * if it exists.
   * @param script
   * @private
   */
  private injectExternalScript(script: InjectableExternalScript): Observable<HTMLScriptElement> {
    return new Observable<HTMLScriptElement>((subscriber) => {
      const existingScript = this.loadedScripts.find((loadedScript) => loadedScript.id === script.id);

      if (existingScript) {
        return subscriber.next(existingScript.scriptReference);
      }

      const scriptElement = this.renderer.createElement('script');
      scriptElement.type = script.type;
      scriptElement.src = script.src;

      this.renderer.appendChild(document.body, scriptElement);
      this.loadedScripts.push({scriptReference: scriptElement, ...script});

      return subscriber.next(scriptElement);
    });
  }
}
