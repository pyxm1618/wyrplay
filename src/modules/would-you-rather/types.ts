export type AudienceType =
  | "kids"
  | "teens"
  | "friends"
  | "couples"
  | "family"
  | "adults"
  | "coworkers";

export type OccasionType =
  | "classroom"
  | "party"
  | "road-trip"
  | "dinner"
  | "date-night"
  | "icebreaker"
  | "birthday-party"
  | "sleepover";

export type StyleType = "funny" | "hard" | "deep" | "easy" | "weird" | "clean";

export type FeaturedCollectionKey = "kids" | "funny" | "hard" | "friends" | "couples";

export interface Question {
  readonly id: string;
  readonly question: string;
  readonly optionA: string;
  readonly optionB: string;
  readonly audience: AudienceType;
  readonly occasion: OccasionType;
  readonly style: StyleType;
  readonly collections: readonly FeaturedCollectionKey[];
  readonly tags: readonly string[];
}

export interface CategoryItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly href?: string;
  readonly count?: number;
}

export interface CollectionMeta {
  readonly key: FeaturedCollectionKey;
  readonly route: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly primaryKeyword: string;
  readonly secondaryKeywords: readonly string[];
  readonly searchIntent: string;
  readonly h1: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly badge: string;
}
