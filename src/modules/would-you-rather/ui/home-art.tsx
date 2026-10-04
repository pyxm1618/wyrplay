type Crop = readonly [number, number, number, number];
export function ArtCrop({
  box,
  className = "",
  label,
}: {
  box: Crop;
  className?: string;
  label?: string;
}) {
  const [x, y, width, height] = box;
  return (
    <svg
      className={`art-crop ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      width={width}
      height={height}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
    >
      <image href="/home-art/reference-art.png" width="778" height="2021" />
    </svg>
  );
}
export function HeroReferenceDetails() {
  return (
    <svg
      className="hero-reference-details"
      viewBox="0 60 778 572"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="hero-reference-cutouts">
          <path d="M0 60H210V280H166L154 305L123 451L138 477H0Z" />
          <path d="M778 185L737 186L702 210L670 219L648 243L624 272L618 290L650 440L648 485H778Z" />
        </clipPath>
      </defs>
      <image
        href="/home-art/reference-art.png"
        width="778"
        height="2021"
        clipPath="url(#hero-reference-cutouts)"
      />
    </svg>
  );
}
export function ChoiceFrame({ variant }: { variant: "dog" | "cat" }) {
  const path =
    variant === "dog"
      ? "M47 1C36-1 31 4 25 20L0 157C-3 173 3 180 21 180L229 176C242 176 248 171 248 158L248 36C249 25 244 19 233 17L52 1Z"
      : "M27 16L203 1C219-1 226 7 232 27L249 151C252 169 247 180 231 180L17 178C5 178 1 174 1 157L1 32C1 23 11 17 27 16Z";
  return (
    <svg
      className="choice-frame"
      viewBox="0 0 249 180"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`choice-gradient-${variant}`} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor={variant === "dog" ? "#ffd355" : "#3fe6ee"} />
          <stop offset=".55" stopColor={variant === "dog" ? "#ff9736" : "#00bcf0"} />
          <stop offset="1" stopColor={variant === "dog" ? "#ff5336" : "#009de4"} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill={`url(#choice-gradient-${variant})`}
        stroke={variant === "dog" ? "#ffebc2" : "#aaf8ff"}
        strokeWidth="3"
      />
    </svg>
  );
}
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
