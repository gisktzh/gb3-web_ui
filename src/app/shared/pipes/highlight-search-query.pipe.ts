import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'highlightSearchQuery',
})
export class HighlightSearchQueryPipe implements PipeTransform {
  public transform(textItem: string, searchQuery: string | string[]): string {
    if (searchQuery === '' || searchQuery.length === 0) {
      return textItem;
    }

    const lookup = this.getRegularExpression(searchQuery);
    const re = new RegExp(lookup, 'ig');

    return textItem.replace(re, '<b>$&</b>');
  }

  /**
   * Returns the regular expression for a given searchquery. If it is a string[], returns a lookup group with all searchqueries as possible
   * matches (e.g. (term1|term2|term3).
   *
   * @param searchQuery
   * @private
   */
  private getRegularExpression(searchQuery: string | string[]): RegExp {
    if (typeof searchQuery === 'string') {
      return new RegExp(this.escapeRegExp(searchQuery).toLowerCase());
    }

    const multipleSearchQueries = searchQuery.map((query) => this.escapeRegExp(query).toLowerCase()).join('|');
    return new RegExp(`(${multipleSearchQueries})`);
  }

  /**
   * Escapes all regex specific special characters
   * Copied from Stack-Overflow: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
   */
  private escapeRegExp(regExp: string): string {
    return regExp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
}
