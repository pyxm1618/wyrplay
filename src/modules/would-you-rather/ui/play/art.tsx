/* eslint-disable @next/next/no-img-element -- Reused local brand artwork. */
import { getQuestionVisual } from "../../data/question-visuals";
import { QuestionVisual } from "../question-visual";

export function PlayArtwork() {
  return (
    <div className="play-art" aria-hidden="true">
      <i className="blob yellow" />
      <i className="blob blue" />
      <i className="blob pink" />
      <i className="blob blue-bottom" />
      <i className="blob yellow-bottom" />
      <img className="art-star" src="/play-art/star.png" alt="" />
      <img className="art-question" src="/play-art/question.png" alt="" />
    </div>
  );
}
export function PlayHeading({ question }: { readonly question: string }) {
  return (
    <div className="play-heading">
      <img className="heading-crown" src="/finder/assets/crown.png" alt="" />
      <h1>
        Would You{" "}
        <span className="word-rather">
          <i>Rath</i>er?
        </span>
      </h1>
      <p>{question}</p>
    </div>
  );
}

export function OptionPanels({
  a,
  b,
  childrenA,
  childrenB,
  questionId,
  isPresenter = false,
}: {
  readonly a: string;
  readonly b: string;
  readonly childrenA?: React.ReactNode;
  readonly childrenB?: React.ReactNode;
  readonly questionId?: string | undefined;
  readonly isPresenter?: boolean | undefined;
}) {
  const visual = getQuestionVisual(questionId);
  const visualSizes = isPresenter
    ? "(max-width: 1024px) 50vw, 800px"
    : "(max-width: 600px) 160px, 360px";

  return (
    <div className="play-options">
      <section className="option-panel option-a">
        {visual ? (
          <QuestionVisual
            visual={visual}
            mode="option-a"
            className="play-option-visual"
            sizes={visualSizes}
          />
        ) : (
          <img className="option-symbol" src="/play-art/clock.png" alt="" />
        )}
        <h2>{a}</h2>
        {childrenA}
      </section>
      <span className="or-disc" aria-hidden="true">
        OR
      </span>
      <section className="option-panel option-b">
        {visual ? (
          <QuestionVisual
            visual={visual}
            mode="option-b"
            className="play-option-visual"
            sizes={visualSizes}
          />
        ) : (
          <img className="option-symbol" src="/play-art/rocket.png" alt="" />
        )}
        <h2>{b}</h2>
        {childrenB}
      </section>
    </div>
  );
}
