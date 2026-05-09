# Theme.md — RunStore design system

> **Direction:** Layout/composition จาก Horizon Courts reference + **color palette จาก Glasshaven (architecture)**
> Mood: moody slate-grey + dark cards, premium-but-quiet
> เว็บเป็น dark canvas ให้รูปสินค้า / lifestyle shot โดดเด่น — ไม่มี accent color, contrast มาจาก surface levels ล้วนๆ

---

## หลักการ (Design principles)

1. **Surface-driven contrast** — ความต่างของ section มาจากระดับ surface (page → card → deep card) ไม่ใช่ accent color
2. **Photo as the only color** — รูปสินค้า/lifestyle shot เป็นจุดสีเดียวในเว็บ
3. **Premium minimal** — typography คม, spacing ใจดี, radius กลาง-ใหญ่
4. **Dark-as-default** — palette นี้คือ default (ไม่ใช่ toggle) ถ้าจะ light mode = เป็นคนละแบรนด์

---

## Color palette

ใช้ **semantic tokens** ผ่าน Tailwind `extend` (`bg-surface`, `text-ink`, ...) ไม่ใช้ arbitrary value (`bg-[#xxx]`) ทุกที่ เพราะแก้ palette ทีเดียวที่เดียว — เป็น design system best practice

### Surface (พื้น/การ์ด)

| Token            | Hex                       | Tailwind ใกล้     | ใช้                                          |
| ---------------- | ------------------------- | ----------------- | -------------------------------------------- |
| `surface`        | `#6B7780`                 | `slate-500` (~)   | page bg (body) — เทาอมฟ้า muted                |
| `surface-card`   | `#1F262A`                 | custom            | card หลัก, hero, dark feature                  |
| `surface-deep`   | `#13181B`                 | custom            | nested card, modal, overlay                    |
| `surface-line`   | `rgba(255,255,255,0.08)`  | `border-white/8`  | เส้นแบ่งภายในการ์ด                              |

### Ink (ตัวอักษร)

| Token        | Hex       | Tailwind ใกล้  | ใช้                                          |
| ------------ | --------- | -------------- | -------------------------------------------- |
| `ink`        | `#F4F4F5` | `zinc-100`     | heading, primary text                        |
| `ink-muted`  | `#A1A8AB` | `zinc-400` (~) | body, description, label                     |
| `ink-faint`  | `#6E7679` | `zinc-500` (~) | caption, meta, disabled                      |

### State colors (ใช้เท่าที่จำเป็น)

| Purpose | Class                | When                          |
| ------- | -------------------- | ----------------------------- |
| Success | `text-emerald-400`   | in stock, order confirmed     |
| Error   | `text-red-400`       | form error, out of stock      |
| Warning | `text-amber-400`     | low stock                     |

> ❌ **ห้าม!** ใช้ blue สด / purple / pink / accent ใดๆ — ทำลาย mood ทันที

---

## Typography

- **Font**: Inter (Latin), fallback ระบบสำหรับไทย — โหลดผ่าน `next/font/google`
- **Hero display**: `text-5xl md:text-7xl font-semibold tracking-tight text-ink`
- **Section heading**: `text-3xl md:text-4xl font-semibold tracking-tight text-ink`
- **Card title**: `text-lg md:text-xl font-semibold text-ink`
- **Body**: `text-base text-ink-muted leading-relaxed`
- **Label / caption**: `text-xs uppercase tracking-widest text-ink-faint`
- **Stats numeric**: `text-4xl md:text-5xl font-semibold tabular-nums text-ink`

**หลักการ:**
- ใช้ `font-medium` (500) – `font-semibold` (600) เป็นหลัก หลีกเลี่ยง `font-bold` (700+) — feel premium มากกว่า
- Heading ใหญ่ใช้ `tracking-tight` ให้แน่นเป็น display feel
- Label เล็กใช้ `uppercase tracking-widest` สำหรับ sport-tech vibe

---

## Spacing & layout

| Element              | Class                                  |
| -------------------- | -------------------------------------- |
| Container            | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Section padding      | `py-16 md:py-24`                       |
| Card padding (small) | `p-6`                                  |
| Card padding (default)| `p-8`                                 |
| Card padding (hero)  | `p-10 md:p-12`                         |
| Grid gap (tight)     | `gap-4`                                |
| Grid gap (default)   | `gap-6`                                |
| Grid gap (loose)     | `gap-8`                                |

---

## Border radius

| Element              | Class           |
| -------------------- | --------------- |
| Pill button / nav    | `rounded-full`  |
| Card (regular)       | `rounded-2xl`   |
| Card (feature/hero)  | `rounded-3xl`   |
| Image inside card    | `rounded-xl`    |
| Input field          | `rounded-lg`    |

---

## Component patterns

### 1. Header

```
┌─────────────────────────────────────────────────────────────┐
│  RunStore       Home  Shop  Brands  About        [Cart ↗]  │
└─────────────────────────────────────────────────────────────┘
```

- `sticky top-0 z-40 bg-surface/70 backdrop-blur border-b border-white/5`
- Logo: `text-ink font-semibold`
- Nav links: `text-ink-muted hover:text-ink transition`
- CTA: Primary pill button (ดู §4)

### 2. Hero card

- Wrapper: `relative rounded-3xl overflow-hidden bg-surface-card`
- Photo: `<Image fill />` + `bg-gradient-to-t from-surface-card via-surface-card/40 to-transparent` overlay
- Heading: `text-5xl md:text-7xl font-semibold tracking-tight text-ink` ทับรูป
- Subtext: `text-ink-muted text-base md:text-lg max-w-md`
- CTA: pill button พร้อม `↗`
- Tag chip มุมล่าง: ดู §4

### 3. Card variants

**a) Dark feature card** (default — palette นี้)
```
bg-surface-card text-ink rounded-3xl p-8 md:p-10
```
ไม่ใส่ border — พึ่ง contrast ระหว่าง surface กับ page

**b) Photo card** (image-led)
```
relative rounded-2xl overflow-hidden
+ image full-bleed
+ bg-gradient-to-t from-surface-card to-transparent (ครึ่งล่าง)
+ text + chip ลอยที่ bottom-left
```

**c) Deep card** (nested)
```
bg-surface-deep rounded-2xl p-6 border border-white/5
```
ใช้ภายใน feature card สำหรับ stat block / list

**d) Product card**
```
bg-surface-card rounded-2xl overflow-hidden border border-white/5
hover:border-white/15 transition
```
- รูปสินค้าด้านบน (square aspect)
- Brand: `text-xs uppercase tracking-widest text-ink-faint`
- Name: `text-base font-medium text-ink`
- Price: `text-lg font-semibold text-ink`

> ⚠️ **Product photo gotcha:** รูปสินค้าที่ background ขาวจะดูแปลกบน dark card ตอน source รูปเลือก: lifestyle shot, on-foot shot, หรือ studio dark background — หรือ apply subtle gradient overlay ตอน render

### 4. Pill button

| Variant   | Tailwind                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Primary   | `rounded-full bg-ink text-surface-card px-6 py-3 text-sm font-medium hover:bg-ink-muted transition`   |
| Secondary | `rounded-full bg-white/10 backdrop-blur text-ink border border-white/10 px-6 py-3 text-sm font-medium hover:bg-white/15` |
| Ghost     | `rounded-full text-ink-muted hover:text-ink px-4 py-2 text-sm transition`                             |
| Tag chip  | `rounded-full bg-white/10 backdrop-blur text-ink-muted px-3 py-1 text-xs uppercase tracking-widest`   |

ลูกศร: ใช้ Lucide `ArrowUpRight` ขนาด 16px ต่อท้ายข้อความ

### 5. Stats row

- Layout: `grid grid-cols-2 md:grid-cols-4 gap-6` ภายใน `bg-surface-card rounded-3xl p-10`
- แต่ละช่อง:
  - Number: `text-4xl md:text-5xl font-semibold tabular-nums text-ink`
  - Label: `text-xs uppercase tracking-widest text-ink-faint mt-1`

---

## ทำไม palette นี้ใช้ได้กับ RunStore

1. **Premium running brands ใช้แนวนี้** — On Running, Hoka flagship, Nike SNKRS dark mode
2. **รองเท้าวิ่งสีจัดอยู่แล้ว** — neon, สีตัด pop ได้ดีบน dark surface (โครงเทา-ดำเป็น canvas สำหรับสี)
3. **Lifestyle shot ของนักวิ่ง** — มักถ่ายเช้ามืด/พลบค่ำ กลมกลืนกับ palette เทาอมฟ้า
4. **Mood "performance/serious"** — ต่างจาก kid-friendly bright store; สื่อสารว่าสินค้าจริงจัง

---

## Tailwind config snippet (ใช้ตอน Phase 3)

```js
// client/tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#6B7780',
          card:    '#1F262A',
          deep:    '#13181B',
        },
        ink: {
          DEFAULT: '#F4F4F5',
          muted:   '#A1A8AB',
          faint:   '#6E7679',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

```css
/* client/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-surface text-ink antialiased;
  }
}
```

```jsx
// client/app/layout.js  (Phase 3 — load Inter)
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## ตัวอย่าง mock layout (RunStore home, palette ใหม่)

```
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■   ← bg-surface (#6B7780)
■                                              ■
■   RunStore   Home Shop Brands About [Cart↗] ■   ← header (translucent)
■                                              ■
■   ┌────────────────────────────────────────┐ ■
■   │ ▓▓▓ photo: runner at dawn ▓▓▓          │ ■   ← hero card
■   │                                        │ ■     bg-surface-card
■   │  BUILT FOR EVERY KILOMETER             │ ■     rounded-3xl
■   │  Lightweight. Durable. Ready.          │ ■
■   │  [Shop now ↗]                          │ ■
■   └────────────────────────────────────────┘ ■
■                                              ■
■   ┌─OUR EDIT─────────────────────────────┐   ■
■   │ 01.ROAD  02.TRAIL  03.TRACK  04.GEAR │   ■   ← feature card
■   │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │   ■     bg-surface-card
■   │ │photo │ │photo │ │photo │ │photo │ │   ■     4 photo cards inside
■   │ └──────┘ └──────┘ └──────┘ └──────┘ │   ■
■   └──────────────────────────────────────┘   ■
■                                              ■
■   ┌─COLLECTION──────────────────────────┐    ■
■   │ ┌─prod─┐ ┌─prod─┐ ┌─prod─┐ ┌─prod─┐│    ■   ← product grid
■   │ │ HOKA │ │ NIKE │ │ASICS │ │  ON  ││    ■     bg-surface-card cards
■   │ │ $189 │ │ $145 │ │ $160 │ │ $200 ││    ■
■   │ └──────┘ └──────┘ └──────┘ └──────┘│    ■
■   └─────────────────────────────────────┘    ■
■                                              ■
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
```

---

## Checklist ก่อน implement Phase 3 (Catalog UI)

- [ ] ปรับ `client/tailwind.config.js` ใส่ `colors.surface` + `colors.ink` + `fontFamily.sans`
- [ ] ปรับ `client/app/globals.css` ใส่ `body { @apply bg-surface text-ink }`
- [ ] โหลด Inter ผ่าน `next/font/google` ใน `app/layout.js`
- [ ] Audit รูปสินค้าทุกตัว — รูปที่ background ขาวต้อง treat ก่อนใช้ (lifestyle shot, gradient overlay, หรือเปลี่ยนรูป)
- [ ] หลีกเลี่ยง `bg-[#xxx]` arbitrary value — ถ้าใช้ซ้ำ ≥ 2 ที่ ให้เพิ่มเป็น semantic token แทน
