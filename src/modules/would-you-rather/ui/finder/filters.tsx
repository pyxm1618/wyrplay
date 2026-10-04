/* eslint-disable @next/next/no-img-element -- Reused native icon artwork. */
import { useState } from "react";
import type { FinderCriteria } from "../../domain/finder";
import { FinderIcon } from "./icon";

const groups = [
  {
    title: "By Age",
    icon: "age",
    key: "age",
    items: [
      ["kids", "Kids"],
      ["teens", "Teens"],
      ["adults", "Adults"],
      ["7-9", "7–9"],
      ["10-12", "10–12"],
    ],
  },
  {
    title: "By Group",
    icon: "group",
    key: "relationship",
    items: [
      ["friends", "Friends"],
      ["couples", "Couples"],
      ["family", "Family"],
      ["coworkers", "Coworkers"],
    ],
  },
  {
    title: "By Occasion",
    icon: "occasion",
    key: "occasion",
    items: [
      ["classroom", "Classroom"],
      ["party", "Party"],
      ["road-trip", "Road Trip"],
      ["date-night", "Date Night"],
      ["dinner", "Dinner"],
    ],
  },
  {
    title: "By Style",
    icon: "style",
    key: "tone",
    items: [
      ["funny", "Funny"],
      ["deep", "Deep"],
      ["weird", "Weird"],
    ],
  },
  {
    title: "Difficulty",
    icon: "difficulty",
    key: "difficulty",
    items: [
      ["easy", "Easy"],
      ["hard", "Hard"],
    ],
  },
] as const;

export function FinderFilters({
  draft,
  onChange,
  onApply,
  onClear,
}: {
  readonly draft: FinderCriteria;
  readonly onChange: (criteria: FinderCriteria) => void;
  readonly onApply: () => void;
  readonly onClear: () => void;
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const activeCount = Object.keys(draft).length;

  return (
    <aside
      className={`filters ${mobileExpanded ? "is-expanded" : "is-collapsed"}`}
      aria-label="Question filters"
    >
      <div className="filter-heading">
        <h2>
          Filters
          {activeCount > 0 ? <span className="filter-count"> ({activeCount})</span> : null}
        </h2>
        <div className="filter-heading-actions">
          <button className="clear-link" onClick={onClear}>
            Clear all
          </button>
          <button
            type="button"
            className="filter-toggle"
            aria-expanded={mobileExpanded}
            aria-controls="filter-body-content"
            onClick={() => setMobileExpanded((prev) => !prev)}
          >
            {mobileExpanded ? "Hide filters" : activeCount > 0 ? "Edit filters" : "Filter options"}
            <span className="filter-toggle-arrow" aria-hidden="true">
              {mobileExpanded ? " ▲" : " ▼"}
            </span>
          </button>
        </div>
      </div>
      <div className="filter-body" id="filter-body-content">
        {groups.map((group) => (
          <section className="filter-group" key={group.key}>
            <h3>
              <img src={`/finder/assets/filter-${group.icon}.png`} alt="" />
              {group.title}
            </h3>
            <div className="filter-options">
              {group.items.map(([value, label]) => (
                <button
                  key={value}
                  className={draft[group.key] === value ? "chosen" : ""}
                  aria-pressed={draft[group.key] === value}
                  onClick={() => {
                    const next = { ...draft };
                    if (next[group.key] === value) delete next[group.key];
                    else Object.assign(next, { [group.key]: value });
                    onChange(next);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
        <button
          className="apply-button black"
          onClick={() => {
            onApply();
            setMobileExpanded(false);
          }}
        >
          <FinderIcon name="filter" />
          Apply Filters <FinderIcon name="arrow" />
        </button>
        <span className="apply-rays" aria-hidden="true">
          〟
        </span>
      </div>
    </aside>
  );
}
