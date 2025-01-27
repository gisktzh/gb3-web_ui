import {SearchResultIdentifierDirective} from './search-result-identifier.directive';
import {ElementRef} from '@angular/core';

describe('SearchResultIdentifierDirective', () => {
  let host: ElementRef<HTMLElement>;
  let directive: SearchResultIdentifierDirective;

  beforeEach(() => {
    host = new ElementRef(document.createElement('div'));
    directive = new SearchResultIdentifierDirective(host);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit addResultFromArrowNavigation when addTemporaryMap is called and isMapResult is true', () => {
    spyOn(directive.addResultFromArrowNavigation, 'emit');
    directive.isMapResult = true;
    directive.addTemporaryMap();
    expect(directive.addResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should not emit addResultFromArrowNavigation when addTemporaryMap is called and isMapResult is false', () => {
    spyOn(directive.addResultFromArrowNavigation, 'emit');
    directive.isMapResult = false;
    directive.addTemporaryMap();
    expect(directive.addResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });

  it('should emit removeResultFromArrowNavigation when removeTemporaryMap is called and isMapResult is true', () => {
    spyOn(directive.removeResultFromArrowNavigation, 'emit');
    directive.isMapResult = true;
    directive.removeTemporaryMap();
    expect(directive.removeResultFromArrowNavigation.emit).toHaveBeenCalled();
  });

  it('should not emit removeResultFromArrowNavigation when removeTemporaryMap is called and isMapResult is false', () => {
    spyOn(directive.removeResultFromArrowNavigation, 'emit');
    directive.isMapResult = false;
    directive.removeTemporaryMap();
    expect(directive.removeResultFromArrowNavigation.emit).not.toHaveBeenCalled();
  });
});
