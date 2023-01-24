import {BasemapImageLinkPipe} from './background-map-image-link.pipe';

describe('BasemapImageLinkPipe', () => {
  it('returns the correct filename', () => {
    const pipe = new BasemapImageLinkPipe();
    const testIdentifier = 'my-test-image';

    const result = pipe.transform('my-test-image');

    const expected = `assets/images/basemaps/${testIdentifier}.png`;
    expect(result).toEqual(expected);
  });
});
