import {ActiveMapItem} from 'src/app/map/models/active-map-item.model';
import {selectHasOerebMapActive} from './has-oereb-map-active.selector';
import {ActiveMapItemFactory} from 'src/app/shared/factories/active-map-item.factory';

function getActiveMapItem(id: string) {
  return ActiveMapItemFactory.createGb2WmsMapItem({
    id,
    title: '',
    uuid: null,
    printTitle: '',
    icon: '',
    organisation: null,
    gb2Url: null,
    keywords: [],
    wmsUrl: '',
    layers: [],
    minScale: null,
    notice: null,
    opacity: 0,
    timeSliderConfiguration: undefined,
    initialTimeSliderExtent: undefined,
  });
}

describe('selectHasOerebMapActive', () => {
  it('returns false if there are no active map items', () => {
    const selectActiveMapItemsMock: ActiveMapItem[] = [];

    const result = selectHasOerebMapActive.projector(selectActiveMapItemsMock);

    expect(result).toBe(false);
  });

  it('returns false of there are active map items, but no OEREB ones', () => {
    const selectActiveMapItemsMock: ActiveMapItem[] = [getActiveMapItem('A platypus?'), getActiveMapItem('Perry the platypus?!')];

    const result = selectHasOerebMapActive.projector(selectActiveMapItemsMock);

    expect(result).toBe(false);
  });

  it('returns true if one active map item is an OEREB map', () => {
    const selectActiveMapItemsMock: ActiveMapItem[] = [
      getActiveMapItem('KatNotOerebNothingToSeeHereZH'),
      getActiveMapItem('KatOerebFlughaefenZH'),
      getActiveMapItem('KatStillNoOerebNothingToSeeHereLeavePleaseZH'),
    ];

    const result = selectHasOerebMapActive.projector(selectActiveMapItemsMock);

    expect(result).toBe(true);
  });

  it('returns true if multiple active map item is an OEREB map', () => {
    const selectActiveMapItemsMock: ActiveMapItem[] = [
      getActiveMapItem('KatNotOerebNothingToSeeHereZH'),
      getActiveMapItem('KatOerebFlughaefenZH'),
      getActiveMapItem('KatStillNoOerebNothingToSeeHereLeavePleaseZH'),
      getActiveMapItem('KatOerebVerEntsorgungZH'),
    ];

    const result = selectHasOerebMapActive.projector(selectActiveMapItemsMock);

    expect(result).toBe(true);
  });
});
