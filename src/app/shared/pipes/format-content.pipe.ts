import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatContent',
  standalone: false,
})
export class FormatContentPipe implements PipeTransform {
  public transform(value: string): string {
    return this.replaceUrls(value);
  }

  public replaceUrls(url: string): string {
    /**
     * Based on https://stackoverflow.com/a/3809435 and extended to provide two capture tokens: (1) the protocol and (2) the host, which
     * allows us to replace links with an accessible label, i.e. there URL without the protocol.
     */
    const urlCapturingGroup = /(https?:\/\/)((www\.)?[-a-zA-Z0-9@:%._+~#?&//=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
    return url.replace(urlCapturingGroup, (match, protocol, host) => {
      const hostWithoutTrailingSlashes = host.endsWith('/') ? host.slice(0, -1) : host;
      return `<a href="${match}" target="_blank" class="link-highlight">${hostWithoutTrailingSlashes}</a>`;
    });
  }
}
