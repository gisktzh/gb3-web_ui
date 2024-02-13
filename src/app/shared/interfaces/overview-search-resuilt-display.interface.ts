export interface OverviewSearchResultDisplayItemField {
  title: string;
  content: string;
  /**
   * For long contents, setting this flag to true will add an ellipsis if the text is too long.
   */
  truncatable?: boolean;
}

export interface OverviewSearchResultDisplayItem {
  // todo LME: maybe use type discrimination for url?
  title: string;
  uuid: string;
  url: {
    /**
     * Whether the URL is internal and should be rendered as routerLink or as normal anchor link
     */
    isInternal: boolean;
    /**
     * The URL's path, which can be a relative path (used for internal links) or an external path
     */
    path: string;
  };
  fields: OverviewSearchResultDisplayItemField[];
}
