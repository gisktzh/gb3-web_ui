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
    expect(links.length).toBe(1);

    const link = links[0] as HTMLLinkElement;
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toContain('assets/esri-theme/light/main.css');
  });

  it('does not add a duplicate stylesheet link when called multiple times', () => {
    void service.ensureLoaded();
    void service.ensureLoaded();
    void service.ensureLoaded();

    const links = document.head.querySelectorAll('#esri-theme-stylesheet');
    expect(links.length).toBe(1);
  });

  it('does not add a duplicate link if one already exists in the document', () => {
    const preExistingLink = document.createElement('link');
    preExistingLink.id = 'esri-theme-stylesheet';
    preExistingLink.rel = 'stylesheet';
    document.head.appendChild(preExistingLink);

    void service.ensureLoaded();

    const links = document.head.querySelectorAll('#esri-theme-stylesheet');
    expect(links.length).toBe(1);
  });
});
