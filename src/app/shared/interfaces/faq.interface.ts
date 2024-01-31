export interface FaqItem {
  uuid: string;
  question: string;
  answer: string;
}

export interface FaqCollection {
  category: string;
  items: FaqItem[];
}
