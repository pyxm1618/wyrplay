# Foundation Coverage Batch 002 — Research

Date: 2026-09-30

## Scope

This batch builds first-layer coverage for the following primary collections:

- teens
- adults
- friends
- family
- couples
- coworkers
- classroom
- party
- road-trip
- dinner
- date-night
- icebreakers
- birthday-party
- sleepover

This is not a Kids expansion batch, and no production question-bank file is modified.

## Protected Kids baseline

The first Kids batch produced 105 candidates and the independent Reviewer marked 58 candidate IDs PASS. Those 58 approved question texts/options were treated as a protected semantic baseline for this batch.

At execution time, the GitHub `main` branch did not contain `content/question-bank/kids.json`. The protected set was therefore reconstructed from the previously recorded 58 PASS candidate IDs and the corresponding original candidate texts from Batch 001. This protected set was used only for de-duplication; none of the Kids questions were rewritten, relabeled, or reused to fill Foundation collections.

Protected PASS candidate IDs:

`004, 006, 008, 009, 012, 014, 015, 016, 017, 019, 023, 024, 025, 028, 029, 030, 035, 037, 039, 041, 042, 043, 044, 046, 049, 050, 051, 054, 055, 057, 058, 059, 060, 065, 068, 069, 071, 072, 073, 075, 076, 077, 079, 081, 082, 083, 084, 085, 087, 091, 092, 093, 094, 097, 098, 100, 101, 103`.

## Public-source research

Research was used to understand usage patterns, tone, age/relationship boundaries, and overused patterns. No source question was used as a rewrite template.

| # | Source | URL | Audience / use | Main learning | Patterns not copied |
|---|---|---|---|---|---|
| 1 | SignUpGenius — Would You Rather Questions for Any Group or Occasion | https://www.signupgenius.com/resources/would-you-rather | Teens, classrooms, coworkers, teams, families | Fast pace, audience matching, and asking “why” are central. Different contexts need different pressure levels. | Classic fly/invisible-style staples, obvious one-sided choices, and direct rewrites of listed prompts. |
| 2 | IcebreakerIdeas — Would You Rather Questions | https://icebreakerideas.com/would-you-rather-questions/ | Teens, adults, couples, parties | Older multi-audience lists show how the format changes by age and relationship. They also expose dated stereotypes and shock-value patterns. | Body humiliation, dating stereotypes, danger, gross-out, financial pressure, and dated teen stereotypes. |
| 3 | teambuilding.com — Would You Rather Questions for Work | https://teambuilding.com/blog/would-you-rather-questions | Coworkers, team building | Workplace questions work when they reveal harmless preferences and trigger follow-up conversation. | Salary, boss evaluation, stealing, humiliating performance, or anything that pressures personal disclosure. |
| 4 | teambuilding.com — Icebreaker Questions | https://teambuilding.com/blog/icebreaker-questions | Work, meetings, mixed groups | Strong icebreakers are personal without being too personal, answerable quickly, and suitable for follow-up. | Trauma, family/private-life disclosure, divisive identity topics, or prompts that depend on pre-existing trust. |
| 5 | SessionLab — Icebreaker Questions | https://www.sessionlab.com/blog/icebreaker-questions/ | Workshops, teams, new groups | Safe-space design and audience fit matter more than cleverness. This-or-that / Would You Rather formats lower entry pressure. | Generic preference prompts that have no dilemma, and questions mismatched to the room. |
| 6 | Paired — Would You Rather Questions for Couples | https://www.paired.com/articles/would-you-rather-questions | Couples, date-night conversation | Couple questions can create useful conversation around shared experiences, routines, planning, and preferences. | Sexual content, ex/jealousy traps, humiliation, “prove your love” framing, and high-stakes relationship tests. |
| 7 | FamilyEducation — Would You Rather Questions for Kids / Families | https://www.familyeducation.com/entertainment-activities/games/family/the-ultimate-list-of-would-you-rather-questions-for-kids | Family dinner, road trips, spontaneous play | Family usage is cross-age, conversational, portable, and often tied to waiting/travel/mealtime contexts. | Treating Family as another name for Kids, gross-out as a major category, or sensitive family comparison. |
| 8 | Parade — Would You Rather Questions | https://parade.com/964027/parade/would-you-rather-questions/ | Adults, friends, game nights | General adult/friend play benefits from a mix of funny, weird, serious, and value-based trade-offs. | Gross, invasive, extreme, or shock-first adult questions. |
| 9 | We Are Teachers — Middle/High School Icebreakers | https://www.weareteachers.com/middle-school-icebreakers/ | Teens, classroom | Would You Rather works as an active icebreaker when students can choose, move, explain, and lightly debate. | Publicly exposing social status, family circumstances, romance, or sensitive personal beliefs. |
| 10 | PsyCat Games — Would You Rather for Adults | https://psycatgames.com/magazine/party-games/would-you-rather-questions-for-adults/ | Adults, parties | Adult demand clearly exists, but many commercial lists equate “adult” with explicit or shock content. This validates a separate clean-Adult product lane. | Sexual, drug/alcohol-centered, gross, cheating, death, humiliation, and NSFW material. |

## Collection design map

### Teens
Use school life, hobbies, skills, independence, creativity, low-stakes social choices, and time trade-offs. Questions should feel older than Kids without drifting into adult romance, alcohol/drugs, financial stress, or disturbing material.

### Adults
Use routines, work-life structure, travel, time, lifestyle, hobbies, planning, and clean values. “Adults” is treated as an age/context layer, not an NSFW category.

### Friends
Questions should become more interesting specifically because friends answer them together: group plans, shared playlists, trips, activities, and communication habits. General-purpose questions are not automatically tagged Friends.

### Family
Cross-age, inclusive, low-pressure, and free of comparison/shame. Family is not used as a Kids synonym.

### Couples
Clean shared-life choices: routines, planning, shared vs separate interests, travel, and communication style. No jealousy traps, exes, sex, financial disclosure, or loyalty tests.

### Coworkers
Office-safe and low-pressure. Focus on meeting style, collaboration, communication, and harmless work preferences. No salary, boss judgments, politics/religion, or evaluation of named coworkers.

### Classroom
Suitable for warm-ups, discussion, brain breaks, and light debate. Every item is classroom-safe and does not require students to reveal private home or social information.

### Party
Fast to understand, playful, and non-invasive. The trade-off is in the activity or group experience rather than personal secrets.

### Road Trip
Questions are tied to the actual in-car/travel experience: route, stops, playlists, snacks, group interaction, and scenery. Merely mentioning travel does not qualify.

### Dinner
Designed for table conversation. They can involve food, but the defining feature is inclusive, low-pressure discussion around a meal.

### Date Night
Couple-specific shared experiences and choices for an evening together. It overlaps with Couples but is more activity- and experience-oriented.

### Icebreakers
Very low disclosure cost, quickly answerable, suitable for people who may not know each other, and easy to follow with a short “why?”

### Birthday Party
The dilemma is specific to birthday-party structure: music, dessert, group creation, decorations, or party format.

### Sleepover
Teen/friend evening conversation and activities. Playful, social, and clean; no horror pressure, explicit material, or humiliation.

## Originality and de-duplication procedure

The candidate set was checked against both the protected 58 Kids PASS questions and itself.

Checks used:

1. **Exact wording check** after normalization.
2. **A/B unordered-pair check** so swapped options count as the same question.
3. **Template/core-dilemma review** to reject “same question, new nouns” variants.
4. **Lexical similarity screen** using word and bigram TF-IDF as a flagging aid, followed by manual semantic review.
5. **Collection-boundary review** so an existing Kids dilemma was not repackaged with older wording or a new scenario label.

No candidate from this batch is intended to be a rewrite of a specific public-source question or of a protected Kids question.

## Batch distribution

- Total candidates: **70**
- Primary collections: **14**, exactly **5 candidates each**
- Age-band tags:
  - Teens: **50**
  - Adults: **55**
  - Counts overlap because many clean questions are suitable for both.
- Mood tags:
  - Light: **47**
  - Thoughtful: **38**
  - Funny: **13**
  - Imaginative: **10**
  - Weird: **5**
- Difficulty:
  - Easy: **27**
  - Hard: **43**

These are candidates for independent review only. They are not approved production questions and should not be written to `content/question-bank/` without Reviewer PASS.
