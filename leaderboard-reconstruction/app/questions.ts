export type Question = {
  id: number;
  art: string;
  title: string;
  tags: string[];
  votes: string;
  comments: string;
  score: number;
  discussion: number;
};
export const questions: Question[] = [
  {
    id: 1,
    art: "travel",
    title: "Travel to the past or travel to the future?",
    tags: ["Travel", "Deep"],
    votes: "521K",
    comments: "3.1K",
    score: 521,
    discussion: 3100,
  },
  {
    id: 2,
    art: "dog-cat",
    title: "Always have a dog as a pet or always have a cat as a pet?",
    tags: ["Animals", "Fun"],
    votes: "412K",
    comments: "2.3K",
    score: 412,
    discussion: 2300,
  },
  {
    id: 3,
    art: "pizza",
    title: "Eat only pizza forever or never eat pizza again?",
    tags: ["Food", "Funny"],
    votes: "398K",
    comments: "1.8K",
    score: 398,
    discussion: 1800,
  },
  {
    id: 4,
    art: "wealth",
    title: "Be rich but unknown or famous but not rich?",
    tags: ["Life", "Deep"],
    votes: "321K",
    comments: "1.6K",
    score: 321,
    discussion: 1600,
  },
  {
    id: 5,
    art: "city",
    title: "Live in a big city or a small town?",
    tags: ["Lifestyle", "Travel"],
    votes: "287K",
    comments: "1.4K",
    score: 287,
    discussion: 1400,
  },
  {
    id: 6,
    art: "music",
    title: "Give up music for a year or movies for a year?",
    tags: ["Entertainment", "Thoughtful"],
    votes: "256K",
    comments: "1.2K",
    score: 256,
    discussion: 1200,
  },
  {
    id: 7,
    art: "clock",
    title: "Always arrive 20 minutes early or 10 minutes late?",
    tags: ["Daily Life", "Funny"],
    votes: "243K",
    comments: "1.1K",
    score: 243,
    discussion: 1100,
  },
  {
    id: 8,
    art: "languages",
    title: "Speak every language or play every instrument?",
    tags: ["Skills", "Deep"],
    votes: "231K",
    comments: "1.0K",
    score: 231,
    discussion: 1000,
  },
  {
    id: 9,
    art: "seasons",
    title: "Have summer forever or winter forever?",
    tags: ["Seasons", "Fun"],
    votes: "208K",
    comments: "892",
    score: 208,
    discussion: 892,
  },
  {
    id: 10,
    art: "space",
    title: "Explore space or the deep ocean?",
    tags: ["Adventure", "Weird"],
    votes: "197K",
    comments: "847",
    score: 197,
    discussion: 847,
  },
];
