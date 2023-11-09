import {MapRotationPipe} from './map-rotation.pipe';

describe('FormatRotationPipe', () => {
  it('formats the rotation correctly', () => {
    const pipe = new MapRotationPipe();

    const rotation = 87;

    const result = pipe.transform(rotation);

    const expected = 'rotate(42deg)';
    expect(result).toEqual(expected);
  });
});
