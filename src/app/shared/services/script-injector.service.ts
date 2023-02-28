import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';

interface InjectableExternalScript {
  src: string;
  type: string;
  id: string;
}

interface InjectedExternalScript extends InjectableExternalScript {
  scriptReference: HTMLScriptElement;
}

const twitterFeedInjectableScript: InjectableExternalScript = {
  id: 'twitter-feed',
  type: 'text/javascript',
  src: 'https://platform.twitter.com/widgets.js'
};

@Injectable({
  providedIn: 'root'
})
export class ScriptInjectorService {
  private readonly loadedScripts: InjectedExternalScript[] = [];
  private readonly renderer: Renderer2;

  constructor(private readonly rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public injectTwitterFeedApi(): Observable<TwitterLike> {
    const hasScriptLoaded = new BehaviorSubject<boolean>(false);

    const injectScript = this.injectScript(twitterFeedInjectableScript).pipe(
      tap((script) => {
        if (typeof twttr !== 'undefined') {
          hasScriptLoaded.next(true);
        } else {
          script.onload = () => {
            hasScriptLoaded.next(true);
          };
        }
      })
    );

    return combineLatest([hasScriptLoaded, injectScript]).pipe(
      filter(([isLoaded, _]) => isLoaded),
      map(() => twttr)
    );
  }

  private injectScript(script: InjectableExternalScript): Observable<HTMLScriptElement> {
    return new Observable<HTMLScriptElement>((subscriber) => {
      const existingScript = this.loadedScripts.find((loadedScript) => loadedScript.id === script.id);

      if (existingScript) {
        return subscriber.next(existingScript.scriptReference);
      }

      const scriptElement = document.createElement('script');
      scriptElement.type = script.type;
      scriptElement.src = script.src;

      this.renderer.appendChild(document.body, scriptElement);
      this.loadedScripts.push({scriptReference: scriptElement, ...script});

      return subscriber.next(scriptElement);
    });
  }
}
