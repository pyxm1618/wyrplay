import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface MasterSpec {
  id: string;
  svg: string;
}

const masters: MasterSpec[] = [
  {
    id: "wyr-000001",
    // Squirrel storytelling vs Turtle joke telling
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
      <defs>
        <linearGradient id="bgA1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff5e6"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
        <linearGradient id="bgB1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ecfeff"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
        <radialGradient id="sun" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffedd5"/>
          <stop offset="100%" stop-color="#f97316" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <!-- Option A: Storytelling Squirrel (0 - 600) -->
      <rect x="0" y="0" width="600" height="600" fill="url(#bgA1)"/>
      <circle cx="300" cy="300" r="220" fill="url(#sun)"/>
      <!-- Forest Floor -->
      <path d="M0 480 Q150 450 300 480 T600 460 L600 600 L0 600 Z" fill="#bbf7d0"/>
      <path d="M0 520 Q200 500 400 530 T600 510 L600 600 L0 600 Z" fill="#86efac"/>
      <!-- Squirrel Tail -->
      <path d="M190 420 C110 370 120 220 220 180 C270 160 300 200 280 260 C260 320 240 370 240 420 Z" fill="#ea580c"/>
      <path d="M200 410 C140 360 150 240 230 200 C260 190 280 220 265 265 C250 310 230 360 230 410 Z" fill="#fdba74"/>
      <!-- Squirrel Body -->
      <ellipse cx="300" cy="390" rx="75" ry="95" fill="#f97316"/>
      <ellipse cx="300" cy="400" rx="55" ry="75" fill="#ffedd5"/>
      <!-- Squirrel Head -->
      <circle cx="300" cy="275" r="55" fill="#f97316"/>
      <polygon points="260,240 270,185 290,230" fill="#ea580c"/>
      <polygon points="340,240 330,185 310,230" fill="#ea580c"/>
      <ellipse cx="280" cy="265" rx="7" ry="10" fill="#1e293b"/>
      <ellipse cx="320" cy="265" rx="7" ry="10" fill="#1e293b"/>
      <polygon points="300,282 292,274 308,274" fill="#7c2d12"/>
      <path d="M292 288 Q300 298 308 288" stroke="#7c2d12" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Story Book -->
      <polygon points="240,430 300,410 360,430 360,480 300,460 240,480" fill="#3b82f6"/>
      <polygon points="245,433 300,414 300,462 245,477" fill="#ffffff"/>
      <polygon points="355,433 300,414 300,462 355,477" fill="#f8fafc"/>
      <line x1="255" y1="438" x2="290" y2="427" stroke="#cbd5e1" stroke-width="3"/>
      <line x1="255" y1="448" x2="290" y2="437" stroke="#cbd5e1" stroke-width="3"/>
      <line x1="310" y1="427" x2="345" y2="438" stroke="#cbd5e1" stroke-width="3"/>
      <line x1="310" y1="437" x2="345" y2="448" stroke="#cbd5e1" stroke-width="3"/>
      <!-- Magical Story Sparkles -->
      <circle cx="210" cy="240" r="5" fill="#f59e0b"/>
      <circle cx="390" cy="270" r="7" fill="#f59e0b"/>
      <circle cx="350" cy="200" r="6" fill="#fbbf24"/>

      <!-- Option B: Joke Telling Turtle (600 - 1200) -->
      <rect x="600" y="0" width="600" height="600" fill="url(#bgB1)"/>
      <circle cx="900" cy="300" r="220" fill="#e0f2fe"/>
      <!-- Stage Floor -->
      <path d="M600 480 Q750 460 900 480 T1200 470 L1200 600 L600 600 Z" fill="#fed7aa"/>
      <path d="M600 520 Q800 500 1000 525 T1200 515 L1200 600 L600 600 Z" fill="#fdba74"/>
      <!-- Turtle Shell -->
      <ellipse cx="900" cy="380" rx="110" ry="85" fill="#15803d"/>
      <ellipse cx="900" cy="375" rx="90" ry="70" fill="#22c55e"/>
      <polygon points="900,325 870,355 930,355" fill="#16a34a"/>
      <polygon points="855,365 885,395 835,395" fill="#16a34a"/>
      <polygon points="945,365 915,395 965,395" fill="#16a34a"/>
      <!-- Turtle Head -->
      <ellipse cx="900" cy="260" rx="48" ry="42" fill="#4ade80"/>
      <circle cx="882" cy="250" r="6" fill="#0f172a"/>
      <circle cx="918" cy="250" r="6" fill="#0f172a"/>
      <!-- Big Laughing Smile -->
      <path d="M876 270 Q900 300 924 270 Z" fill="#dc2626"/>
      <!-- Party Joke Hat -->
      <polygon points="875,225 900,165 925,225" fill="#f43f5e"/>
      <circle cx="900" cy="160" r="8" fill="#fbbf24"/>
      <!-- Vintage Microphone on Stand -->
      <line x1="990" y1="280" x2="990" y2="470" stroke="#64748b" stroke-width="8"/>
      <ellipse cx="990" cy="470" rx="28" ry="10" fill="#475569"/>
      <rect x="975" y="250" width="30" height="42" rx="15" fill="#94a3b8"/>
      <line x1="978" y1="262" x2="1002" y2="262" stroke="#475569" stroke-width="3"/>
      <line x1="978" y1="272" x2="1002" y2="272" stroke="#475569" stroke-width="3"/>
      <!-- Laugh notes -->
      <text x="820" y="220" font-family="Arial, sans-serif" font-weight="bold" font-size="28" fill="#f59e0b">Haha!</text>
      <text x="960" y="210" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#3b82f6">♪</text>
    </svg>`,
  },
  {
    id: "wyr-000002",
    // Pillow room vs Blanket tunnel
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
      <defs>
        <linearGradient id="bgA2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fae8ff"/>
          <stop offset="100%" stop-color="#f5d0fe"/>
        </linearGradient>
        <linearGradient id="bgB2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <!-- Option A: Hop across a room of pillows (0 - 600) -->
      <rect x="0" y="0" width="600" height="600" fill="url(#bgA2)"/>
      <circle cx="300" cy="200" r="160" fill="#fdf4ff"/>
      <!-- Fluffy Pillows Mountain -->
      <!-- Pillow 1 (Bottom Left) -->
      <rect x="50" y="420" width="180" height="110" rx="35" fill="#38bdf8" transform="rotate(-8 140 475)"/>
      <circle cx="140" cy="475" r="14" fill="#0284c7"/>
      <!-- Pillow 2 (Bottom Right) -->
      <rect x="360" y="410" width="190" height="120" rx="40" fill="#f43f5e" transform="rotate(10 455 470)"/>
      <circle cx="455" cy="470" r="15" fill="#be123c"/>
      <!-- Pillow 3 (Center) -->
      <rect x="180" y="320" width="220" height="130" rx="45" fill="#fbbf24" transform="rotate(-2 290 385)"/>
      <circle cx="290" cy="385" r="16" fill="#d97706"/>
      <!-- Pillow 4 (Top Bouncing Target) -->
      <rect x="230" y="210" width="160" height="100" rx="35" fill="#a855f7" transform="rotate(6 310 260)"/>
      <circle cx="310" cy="260" r="12" fill="#7e22ce"/>
      <!-- Jump Motion Lines -->
      <path d="M120 360 Q180 230 260 210" stroke="#ec4899" stroke-width="5" stroke-dasharray="10 8" fill="none"/>
      <circle cx="260" cy="210" r="7" fill="#ec4899"/>

      <!-- Option B: Crawl through a tunnel of blankets (600 - 1200) -->
      <rect x="600" y="0" width="600" height="600" fill="url(#bgB2)"/>
      <!-- Blanket Fort Arch Tunnel -->
      <ellipse cx="900" cy="360" rx="240" ry="190" fill="#312e81"/>
      <ellipse cx="900" cy="370" rx="190" ry="150" fill="#1e1b4b"/>
      <ellipse cx="900" cy="390" rx="140" ry="110" fill="#4338ca"/>
      <!-- Warm Glow Inside Tunnel -->
      <ellipse cx="900" cy="400" rx="90" ry="70" fill="#fef08a"/>
      <!-- String Lights Across Fort -->
      <path d="M660 210 Q900 320 1140 210" stroke="#fef08a" stroke-width="4" fill="none"/>
      <circle cx="720" cy="245" r="9" fill="#fde047"/>
      <circle cx="790" cy="265" r="9" fill="#fde047"/>
      <circle cx="870" cy="275" r="9" fill="#fde047"/>
      <circle cx="940" cy="272" r="9" fill="#fde047"/>
      <circle cx="1020" cy="255" r="9" fill="#fde047"/>
      <circle cx="1090" cy="230" r="9" fill="#fde047"/>
      <!-- Blanket Folds & Texture -->
      <path d="M640 490 Q760 380 900 480 Q1040 380 1160 490" stroke="#6366f1" stroke-width="24" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: "wyr-000003",
    // Bubbles follow you vs Paper airplanes follow you
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
      <defs>
        <linearGradient id="bgA3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e0e7ff"/>
          <stop offset="100%" stop-color="#c7d2fe"/>
        </linearGradient>
        <linearGradient id="bgB3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef9c3"/>
          <stop offset="100%" stop-color="#fde047"/>
        </linearGradient>
        <radialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#a5f3fc" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#f472b6" stop-opacity="0.7"/>
        </radialGradient>
      </defs>
      <!-- Option A: Bubbles following (0 - 600) -->
      <rect x="0" y="0" width="600" height="600" fill="url(#bgA3)"/>
      <!-- Shimmering Soap Bubbles -->
      <circle cx="280" cy="300" r="85" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="4"/>
      <ellipse cx="255" cy="270" rx="20" ry="10" fill="#ffffff" opacity="0.8" transform="rotate(-30 255 270)"/>
      <circle cx="160" cy="190" r="50" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="3"/>
      <ellipse cx="145" cy="175" rx="12" ry="6" fill="#ffffff" opacity="0.8" transform="rotate(-30 145 175)"/>
      <circle cx="420" cy="210" r="60" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="150" cy="420" r="65" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="390" cy="430" r="55" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="250" cy="470" r="35" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="330" cy="150" r="30" fill="url(#bubbleGrad)" stroke="#38bdf8" stroke-width="2"/>
      <!-- Streamer path -->
      <path d="M100 480 Q250 250 480 320" stroke="#818cf8" stroke-width="4" stroke-dasharray="8 6" fill="none"/>

      <!-- Option B: Paper airplanes following (600 - 1200) -->
      <rect x="600" y="0" width="600" height="600" fill="url(#bgB3)"/>
      <!-- Big Sky Clouds -->
      <ellipse cx="900" cy="180" rx="140" ry="60" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="800" cy="200" rx="90" ry="50" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="1020" cy="190" rx="100" ry="50" fill="#ffffff" opacity="0.7"/>
      <!-- Main Paper Airplane -->
      <g transform="translate(850, 240) rotate(-15)">
        <polygon points="0,0 160,50 40,80" fill="#ffffff" stroke="#0284c7" stroke-width="3"/>
        <polygon points="40,80 160,50 30,120" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
        <polygon points="0,0 40,80 30,120" fill="#bae6fd"/>
      </g>
      <!-- Follower Plane 2 -->
      <g transform="translate(720, 160) rotate(-25) scale(0.65)">
        <polygon points="0,0 160,50 40,80" fill="#ffffff" stroke="#f43f5e" stroke-width="3"/>
        <polygon points="40,80 160,50 30,120" fill="#ffe4e6" stroke="#f43f5e" stroke-width="3"/>
      </g>
      <!-- Follower Plane 3 -->
      <g transform="translate(1010, 360) rotate(-5) scale(0.75)">
        <polygon points="0,0 160,50 40,80" fill="#ffffff" stroke="#16a34a" stroke-width="3"/>
        <polygon points="40,80 160,50 30,120" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
      </g>
      <!-- Follower Plane 4 -->
      <g transform="translate(730, 390) rotate(-10) scale(0.6)">
        <polygon points="0,0 160,50 40,80" fill="#ffffff" stroke="#ea580c" stroke-width="3"/>
        <polygon points="40,80 160,50 30,120" fill="#ffedd5" stroke="#ea580c" stroke-width="3"/>
      </g>
      <!-- Gliding flight trails -->
      <path d="M680 430 Q780 320 860 270" stroke="#38bdf8" stroke-width="4" stroke-dasharray="10 8" fill="none"/>
      <path d="M700 230 Q780 180 840 250" stroke="#f43f5e" stroke-width="4" stroke-dasharray="8 6" fill="none"/>
    </svg>`,
  },
  {
    id: "wyr-000004",
    // Feed carrots to giraffe vs Feed apples to pony
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
      <defs>
        <linearGradient id="bgA4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ecfdf5"/>
          <stop offset="100%" stop-color="#a7f3d0"/>
        </linearGradient>
        <linearGradient id="bgB4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff1f2"/>
          <stop offset="100%" stop-color="#fecdd3"/>
        </linearGradient>
      </defs>
      <!-- Option A: Feed carrots to giraffe (0 - 600) -->
      <rect x="0" y="0" width="600" height="600" fill="url(#bgA4)"/>
      <circle cx="300" cy="400" r="220" fill="#6ee7b7" opacity="0.4"/>
      <!-- Giraffe Long Neck & Head -->
      <path d="M380 600 L320 220 L270 240 L300 600 Z" fill="#fcd34d"/>
      <ellipse cx="260" cy="200" rx="60" ry="40" fill="#fcd34d" transform="rotate(-15 260 200)"/>
      <polygon points="300,170 315,110 325,125" fill="#f59e0b"/>
      <circle cx="315" cy="110" r="7" fill="#b45309"/>
      <polygon points="275,160 280,105 292,120" fill="#f59e0b"/>
      <circle cx="280" cy="105" r="7" fill="#b45309"/>
      <!-- Giraffe Spots -->
      <polygon points="330,300 360,320 350,350 320,330" fill="#b45309"/>
      <polygon points="310,400 345,410 335,450 305,430" fill="#b45309"/>
      <polygon points="325,500 365,515 350,560 315,540" fill="#b45309"/>
      <circle cx="245" cy="190" r="8" fill="#1e293b"/>
      <!-- Big Crunchy Carrot being offered -->
      <polygon points="120,290 230,220 220,205 110,270" fill="#ea580c"/>
      <polygon points="110,270 70,295 90,260" fill="#16a34a"/>
      <polygon points="100,280 65,270 85,250" fill="#22c55e"/>

      <!-- Option B: Feed apples to a gentle pony (600 - 1200) -->
      <rect x="600" y="0" width="600" height="600" fill="url(#bgB4)"/>
      <circle cx="900" cy="400" r="220" fill="#fda4af" opacity="0.3"/>
      <!-- Sweet Pony Body & Mane -->
      <ellipse cx="940" cy="440" rx="140" ry="110" fill="#d97706"/>
      <path d="M880 430 L820 260 L890 240 L940 390 Z" fill="#d97706"/>
      <ellipse cx="790" cy="270" rx="70" ry="45" fill="#d97706" transform="rotate(20 790 270)"/>
      <!-- Pony Ears -->
      <polygon points="840,230 855,160 880,210" fill="#b45309"/>
      <!-- Pony Fluffy Mane -->
      <path d="M860 190 Q920 220 900 320 Q950 360 930 420" stroke="#fef3c7" stroke-width="26" stroke-linecap="round" fill="none"/>
      <!-- Pony Eye & Muzzle -->
      <circle cx="810" cy="255" r="9" fill="#1e293b"/>
      <ellipse cx="740" cy="285" rx="35" ry="30" fill="#fed7aa"/>
      <circle cx="735" cy="285" r="5" fill="#78350f"/>
      <!-- Juicy Red Apple -->
      <circle cx="680" cy="330" r="38" fill="#dc2626"/>
      <circle cx="665" cy="315" r="8" fill="#ffffff" opacity="0.6"/>
      <path d="M680 292 Q690 270 698 265" stroke="#78350f" stroke-width="4" fill="none"/>
      <ellipse cx="705" cy="275" rx="14" ry="7" fill="#16a34a" transform="rotate(-20 705 275)"/>
    </svg>`,
  },
];

async function main() {
  for (const m of masters) {
    const masterPath = join(process.cwd(), "content/question-bank/visual-masters", `${m.id}.svg`);
    const masterPngPath = join(process.cwd(), "content/question-bank/visual-masters", `${m.id}.png`);
    const publicPngPath = join(process.cwd(), "public/question-visuals", `${m.id}.png`);

    writeFileSync(masterPath, m.svg, "utf-8");

    // 输出标准的 1200x600 2:1 PNG 母版
    await sharp(Buffer.from(m.svg))
      .resize(1200, 600)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(masterPngPath);

    // 复制/发布到 public/question-visuals/
    await sharp(Buffer.from(m.svg))
      .resize(1200, 600)
      .png({ quality: 90 })
      .toFile(publicPngPath);

    console.log(`Generated master and public visual for ${m.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
