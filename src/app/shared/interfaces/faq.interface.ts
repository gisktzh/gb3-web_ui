interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCollection {
  category: string;
  items: FaqItem[];
}
