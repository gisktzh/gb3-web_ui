interface HighlightStyle {
  /**
   * Width of the element. Only has an effect if the property it is applied to supports width, e.g. LineStrings.
   */
  width: number;
  /**
   * RGBA color property, where a is a value between 0.0 and 1.0
   */
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface DefaultHighlightStyles {
  feature: HighlightStyle;
  outline: HighlightStyle;
}

export const defaultHighlightStyles: DefaultHighlightStyles = {
  feature: {
    width: 5,
    color: {
      r: 255,
      g: 255,
      b: 0,
      a: 0.6
    }
  },
  outline: {
    width: 5,
    color: {
      r: 255,
      g: 255,
      b: 0,
      a: 1.0
    }
  }
};
