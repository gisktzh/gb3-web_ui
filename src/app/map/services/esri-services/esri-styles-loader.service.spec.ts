import {TestBed} from '@angular/core/testing';
import {DOCUMENT} from '@angular/core';

import {EsriStylesLoaderService} from './esri-styles-loader.service';

describe('EsriStylesLoaderService', () => {
  let service: EsriStylesLoaderService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriStylesLoaderService);
    document = TestBed.inject(DOCUMENT);
    document.getElementById('esri-theme-stylesheet')?.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds exactly one stylesheet link to the document head', () => {
    void service.ensureLoaded();

    const links = document.head.querySelectorAll('#esri-theme-stylesheet');
    expect(links).toHaveLength(1);

    const link = links[0] as HTMLLinkElement;
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toContain('assets/esri-theme/light/main.css');
  });

  it('does not add a duplicate stylesheet link when called multiple times', () => {
    void service.ensureLoaded();
    void service.ensureLoaded();
    void service.ensureLoaded();

    const links = document.head.querySelectorAll('#esri-theme-stylesheet');
    expect(links).toHaveLength(1);
  });

  it('does not add a duplicate link if one already exists in the document', () => {
    const preExistingLink = document.createElement('link');
    preExistingLink.id = 'esri-theme-stylesheet';
    preExistingLink.rel = 'stylesheet';
    document.head.appendChild(preExistingLink);

    void service.ensureLoaded();

    const links = document.head.querySelectorAll('#esri-theme-stylesheet');
    expect(links).toHaveLength(1);
  });
  it('shares one pending request and resolves only when the stylesheet loads', async () => {
    const first = service.ensureLoaded();
    expect(service.ensureLoaded()).toBe(first);
    const resolved = vi.fn();
    void first.then(resolved);
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();
    document.getElementById('esri-theme-stylesheet')!.dispatchEvent(new Event('load'));
    await first;
    expect(resolved).toHaveBeenCalledOnce();
  });

  it('waits for an existing pending link', async () => {
    const link = document.createElement('link');
    link.id = 'esri-theme-stylesheet';
    document.head.appendChild(link);
    const resolved = vi.fn();
    const pending = service.ensureLoaded().then(resolved);
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();
    link.dispatchEvent(new Event('load'));
    await pending;
    expect(resolved).toHaveBeenCalledOnce();
  });

  it('removes a failed request and allows a later map visit to retry', async () => {
    const pending = service.ensureLoaded();
    const rejected = expect(pending).rejects.toThrow('Could not load ArcGIS theme');
    document.getElementById('esri-theme-stylesheet')!.dispatchEvent(new Event('error'));
    await rejected;
    expect(document.getElementById('esri-theme-stylesheet')).toBeNull();
    const retry = service.ensureLoaded();
    document.getElementById('esri-theme-stylesheet')!.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBeUndefined();
  });
});
