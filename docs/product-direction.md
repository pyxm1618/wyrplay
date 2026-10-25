# WYRPlay product direction

## Product purpose

WYRPlay helps people quickly find a suitable Would You Rather question set, make a choice, see real aggregate results, and continue playing. It also supports live group use through Presenter and printable formats.

The product is intentionally simple: good reviewed questions, clear selection, reliable voting, and reusable play formats.

## Core principles

1. **No registration required for core play.** Browsing and normal gameplay should not depend on an account.
2. **Human-reviewed content.** WYRPlay is not an AI question generator. Published question content and suitability are editorial facts.
3. **One canonical question identity.** Every formal question has a stable ID. Semantic rewrites create a new ID so historic votes are not attached to a materially different dilemma.
4. **Real results only.** Public vote counts come from stored product votes. Do not invent demo percentages as production results.
5. **Kids is a privacy boundary, not just a filter.** Child-directed voting must keep the stricter non-persistent identification behavior implemented by the product.
6. **One question bank, many views.** Home, collections, Finder, Play, Presenter, Print, and Leaderboards consume the same reviewed canonical pool rather than maintaining copied question lists.
7. **Useful taxonomy, not taxonomy for its own sake.** Age, relationship, scenario, mood, difficulty, topic, and safety fields exist to improve selection and editorial control. They do not automatically become navigation items or SEO pages.
8. **Few durable SEO pages.** Keep pages only when they represent a distinct user search intent and have enough reviewed content. Do not generate crawlable pages for every filter combination.
9. **Graceful optional artwork.** A question may have an approved illustration master, but gameplay must remain complete when no artwork exists.
10. **Product evidence lives in tests and source data.** Completed implementation plans, screenshot rounds, and acceptance reports do not remain as parallel product specifications.

## Current product surfaces

Current public product surfaces include:

- Home
- Find Questions
- Play
- Print
- Presenter
- Leaderboards
- Would You Rather Questions for Kids
- Funny Would You Rather Questions
- Hard Would You Rather Questions
- Would You Rather Questions for Friends
- Would You Rather Questions for Couples

The route registry remains the authority for indexability and SEO intent.

## Current content model

The canonical source is `content/question-bank/questions.json`.

The current production contract test requires 512 formal questions and 512 approved questions. Future counts may change through reviewed editorial work; code and tests, not this document, remain authoritative for the exact count.

Important dimensions include:

- age bands;
- relationships;
- scenarios;
- moods;
- difficulty;
- topics;
- safety;
- primary collection.

These dimensions may overlap. A question does not need a single exclusive category beyond its stable identity.

## Kids content

Kids content should be understandable, safe, and useful for the declared age range. Classroom-safe and family-safe are separate editorial decisions from merely being child-safe.

WYRPlay currently supports age bands 4–6, 7–9, and 10–12 in the Kids product. Lower-age content may assume an adult reads the question aloud.

Do not create persistent child accounts, behavioral profiles, or reusable Kids voting identifiers merely to improve analytics or deduplication.

## Product boundaries

Current production does not require:

- AI generation or AI recommendations;
- user-generated public questions;
- real-time multiplayer rooms;
- chat/comments;
- complex anti-cheat systems;
- a CMS solely to avoid editing the canonical question source;
- accounts or paid subscriptions for core play.

Auth and commerce infrastructure may remain dormant in the platform code, but dormant capability is not a reason to expose it in the product.

## Success standard

A release is good when a user can:

1. find an appropriate reviewed question set;
2. make or change a choice with clear feedback;
3. see truthful stored aggregate results where voting applies;
4. continue through the selected set;
5. use the same content in Presenter or Print when relevant;
6. do all of this on supported screen sizes without breaking privacy or SEO constraints.
