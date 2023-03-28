/**
 * Generated using http://json2ts.com/ and the output from the endpoint.
 */
export interface News {
  title: string;
  date: string;
  type: string;
  link: string;
  teaserText?: string;
  teaserImage?: string;
  alt?: string;
}

export interface RootObject {
  news: News[];
  numberOfResultPages: number;
}
