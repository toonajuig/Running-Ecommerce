# Task.md — RunStore (ร้านรองเท้าวิ่ง + อุปกรณ์เสริมการวิ่ง)

> Roadmap สำหรับ mini ecommerce project นี้
> หลักการ: ทำ phase ต่อ phase, แต่ละ phase ใช้งานได้จริงก่อนค่อยข้ามไป phase ถัดไป
> ✅ = เสร็จ / 🚧 = กำลังทำ / ⬜ = ยังไม่เริ่ม

---

## 🎯 ภาพรวมสินค้า

**หมวดหลัก 2 หมวด:**

1. **รองเท้าวิ่ง (Running Shoes)** — มี attribute เฉพาะ: brand, size (EU/US), gender, type (road / trail / track), weight, drop
2. **อุปกรณ์เสริมการวิ่ง (Running Accessories)** — เช่น ถุงเท้า, ขวดน้ำ/hydration vest, นาฬิกา GPS, สายคาดเอว/แขน, headband, foam roller

ทั้งสองหมวด share ฟิลด์พื้นฐาน (name, price, stock, image) แต่ shoes ต้องมีระบบ **size variant** (รองเท้าเบอร์ 42 กับ 43 = stock แยกกัน)

---

## ✅ สิ่งที่ scaffold ไว้แล้ว

- Monorepo (`client/`, `server/`) + npm workspaces
- DB schema เริ่มต้น: `users`, `products`, `orders`, `order_items` (`sql/init.sql`)
- Express MVC: routes → controllers → models → `pg` pool
- JWT auth middleware (`requireAuth`, `requireRole`)
- Order creation transaction (`SELECT ... FOR UPDATE`)
- Next.js 15 App Router + Tailwind + TanStack Query
- หน้า home ที่ดึง `/products` มาแสดง

---

## Phase 1 — Foundation: ปรับ schema ให้รองรับร้านรองเท้าวิ่ง ✅

> ทำก่อนสุดเพราะ schema กระทบทุกอย่าง ถ้าแก้ทีหลังจะลำบาก

- [x] **1.1** เพิ่มตาราง `categories` (id, slug, name) — `running-shoes`, `accessories`
- [x] **1.2** เพิ่มตาราง `brands` (id, slug, name, logo_url) — Nike, Adidas, Asics, Hoka, Saucony, ...
- [x] **1.3** เพิ่มคอลัมน์ใน `products`: `category_id` (FK), `brand_id` (FK nullable), `gender` (`men`/`women`/`unisex`/null), `shoe_type` (`road`/`trail`/`track`/null), `weight_grams`, `drop_mm`
- [x] **1.4** เพิ่มตาราง `product_variants` (id, product_id, size, sku, stock, price_override) — ย้าย stock ออกจาก `products` มาที่นี่สำหรับรองเท้า; accessories มี variant เดียว (one-size)
- [x] **1.5** อัปเดต `order_items` ให้อ้าง `variant_id` แทน `product_id` (เก็บไซส์ที่ซื้อจริง)
- [x] **1.6** สร้าง `sql/seed.sql` ใส่ข้อมูลตัวอย่าง: 2 categories, ~5 brands, ~10 รองเท้า (3 ไซส์ต่อรุ่น), ~6 accessories
- [x] **1.7** เพิ่ม `npm run db:seed` ใน server scripts

**📚 สิ่งที่จะได้เรียนรู้:** การออกแบบ relational schema, normalization, FK กับ cascade, การออกแบบ variant สำหรับ ecommerce จริง

---

## Phase 2 — Backend API: Catalog ✅

- [x] **2.1** Update `productModel.list()` ให้รองรับ filter ผ่าน query string: `?category=running-shoes&brand=nike&gender=men&minPrice=2000&maxPrice=5000&sort=price_asc`
- [x] **2.2** เพิ่ม pagination: `?page=1&limit=12` → return `{ items, total, page, totalPages }`
- [x] **2.3** เพิ่ม endpoint `GET /api/categories` และ `GET /api/brands`
- [x] **2.4** Update `GET /api/products/:id` ให้ join `brand`, `category`, และ list `variants` มาด้วย
- [x] **2.5** เพิ่ม endpoint `GET /api/products/search?q=...` (ใช้ `ILIKE` — รวมใน list() ผ่าน `?q=...`)

**📚 สิ่งที่จะได้เรียนรู้:** parameterized SQL กับ filter ที่ optional, การกัน SQL injection, pagination patterns, การ JOIN หลายตาราง

---

## Phase 3 — Frontend: Catalog UI ✅

> **Prerequisite:** อ่าน `Theme.md` ก่อน — Phase 3 ใช้ design tokens (`bg-surface`, `text-ink`, ...) จากที่นั่น
> Phase นี้รวมการตั้งค่า theme: ปรับ `tailwind.config.js`, โหลด Inter, ตั้ง `body { @apply bg-surface text-ink }` ใน `globals.css`

- [x] **3.1** หน้า `/` (รายการสินค้า) — grid + sidebar filter (category, brand, gender, sort)
- [x] **3.2** หน้า `/products/[id]` (รายละเอียดสินค้า) — แสดงรูป, ราคา, brand, ตารางไซส์ + ปุ่มเลือกไซส์
- [x] **3.3** Component: `<Filters />`, `<Pagination />`, `<ProductCard />`, `<Header />`
- [x] **3.4** ใช้ `useQuery` กับ `queryKey: ['products', filters, page]` เพื่อให้ filter เปลี่ยน → refetch อัตโนมัติ
- [x] **3.5** อ่าน filter จาก URL query string (`useSearchParams`) เพื่อให้แชร์ลิงก์ได้

**📚 สิ่งที่จะได้เรียนรู้:** Server Components vs Client Components ใน App Router, TanStack Query กับ dynamic queryKey, URL state management

---

## Phase 4 — Auth UI ✅

> Backend auth พร้อมแล้ว, ทำ UI ให้ login/register ได้

- [x] **4.1** หน้า `/login` และ `/register` (form + validation)
- [x] **4.2** Auth context หรือ Zustand store เก็บ user + token — ใช้ `AuthContext`
- [x] **4.3** ตัดสินใจที่เก็บ token: `httpOnly cookie` (ปลอดภัยกว่า) vs `localStorage` (ง่ายกว่า) — สำหรับ learning project ใช้ `localStorage` ก่อน แล้วเรียน cookie ทีหลัง
- [x] **4.4** `<NavBar />` ที่แสดง "Login" หรือ "Hi, {name}" + ปุ่ม logout — ทำเป็น `<Header />`
- [x] **4.5** `<RequireAuth />` wrapper redirect ไป /login ถ้ายังไม่ login — ใช้กับ /cart, /orders, /orders/[id]

**📚 สิ่งที่จะได้เรียนรู้:** การจัดการ auth state ใน React, แลกได้แลกเสียระหว่าง localStorage vs cookie, protected routes, ทำไม XSS ทำให้ token ใน localStorage อันตราย

---

## Phase 5 — Cart (ตะกร้าสินค้า) ✅

> Cart เป็น **client-side only** ใน mini project นี้ (เก็บใน `localStorage`) — ไม่ต้องมี cart table ใน DB
> ทางเลือก server-side cart ทำใน Phase 7 ถ้าอยากเรียนเพิ่ม

- [x] **5.1** `lib/cart.js` — ทำเป็น `CartContext` แทน (ครอบ state + localStorage ใน Context เลย ไม่ต้องแยก utility)
- [x] **5.2** Zustand store หรือ React Context ห่อ cart state — ใช้ `CartContext`
- [x] **5.3** ปุ่ม "Add to cart" ในหน้า product detail (ต้องเลือกไซส์ก่อน)
- [x] **5.4** หน้า `/cart` — list รายการ, ปรับจำนวน, ลบ, แสดงยอดรวม
- [x] **5.5** Cart icon ใน NavBar ที่โชว์จำนวน items
- [x] **5.6** re-validate ราคา + stock จาก `GET /api/products/variants?ids=...` ทุกครั้งที่เปิด cart

**📚 สิ่งที่จะได้เรียนรู้:** ทำไม cart ต้อง re-validate ราคา/stock ทุกครั้งก่อนแสดง (กันราคาเก่าที่เก็บใน localStorage), client state vs server state

---

## Phase 6 — Checkout & Orders ✅

- [x] **6.1** Checkout อยู่ใน /cart page (ไม่แยก /checkout เพื่อความเรียบง่าย)
- [ ] **6.2** เพิ่มตาราง `addresses` — ข้ามไปก่อน (Phase 8 polish)
- [ ] **6.3** POST /api/orders รับ address — ข้ามไปก่อน (Phase 8 polish)
- [x] **6.4** `orderModel.createWithItems` lock `product_variants` + decrement stock
- [x] **6.5** หน้า `/orders` — list ออเดอร์ของ user พร้อม status badge
- [x] **6.6** หน้า `/orders/[id]` — รายละเอียดออเดอร์ + status + link กลับ /orders
- [x] **6.7** Mock payment — ปุ่ม "Simulate payment" เปลี่ยน status `pending` → `paid` พร้อม state machine

**📚 สิ่งที่จะได้เรียนรู้:** Database transaction กับ FOR UPDATE สำหรับกัน race condition (สำคัญมาก: 2 คนซื้อรองเท้าคู่สุดท้ายพร้อมกัน → ต้องมีคนเดียวที่ได้), order state machine

---

## Phase 7 — Admin Panel ✅

> เริ่มจากของพื้นฐาน: เพิ่ม/แก้สินค้า + ดูออเดอร์

- [x] **7.1** `/admin` layout guard ด้วย `<RequireAdmin />` (role === 'admin') + tab nav
- [x] **7.2** CRUD สินค้า + variant (add/edit/delete product, update stock inline)
- [x] **7.3** Image URL input (ไม่ทำ file upload จริง — Phase 8)
- [x] **7.4** `/admin/orders` — list ออเดอร์ทุก user + dropdown เปลี่ยน status ได้ทันที
- [x] **7.5** `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, variant CRUD endpoints

**📚 สิ่งที่จะได้เรียนรู้:** RBAC (Role-Based Access Control), การออกแบบ admin API แยกจาก user API, file upload patterns

---

## Phase 8 — Polish (optional) ⬜

ทำเมื่อ phase ก่อนหน้าเสร็จหมดแล้ว เลือกที่อยากเรียน:

- [ ] Search bar + autocomplete (PostgreSQL `pg_trgm` หรือ full-text search)
- [ ] Server-side cart (DB-backed) เพื่อให้ใช้ข้าม device
- [ ] Wishlist
- [ ] Product reviews (ตาราง `reviews` + average rating)
- [ ] Coupon codes
- [ ] Email notifications (order confirmation) — ใช้ Resend/Nodemailer
- [ ] Image upload จริง — Cloudinary หรือ S3
- [ ] Stripe test-mode integration
- [ ] Rate limiting (express-rate-limit)
- [ ] Refresh token rotation
- [ ] Migrate from `localStorage` token → `httpOnly cookie`
- [ ] Tests — Vitest สำหรับ models, Playwright สำหรับ E2E
- [ ] Deploy — Vercel (client) + Railway/Render (server + DB)

---

## ลำดับแนะนำ

```
Phase 1  ─►  Phase 2  ─►  Phase 3  ─►  Phase 4  ─►  Phase 5  ─►  Phase 6  ─►  Phase 7
 schema       API           UI          auth         cart        checkout     admin
```

แต่ละ phase **ทำงานได้เป็นชิ้นเป็น phase** — ไม่ต้องรอจบทั้งหมดถึงจะเทสได้ เช่น Phase 2 เสร็จก็เปิด `/api/products?category=running-shoes` ผ่าน Postman ได้แล้ว

---

## Tip ตอนทำ

- หลัง Phase 1 ทุกครั้งที่รัน `npm run db:init` จะลบข้อมูลหมด → จำไว้รัน `db:seed` ตามด้วย
- ก่อนเริ่ม phase ใหม่ commit code phase เก่าก่อน (เผื่อพังจะ rollback ได้)
- ถ้าติดตรงไหน ถาม Claude ได้เลย — ให้บอกว่ากำลังทำ task ไหนใน Phase ไหน เพื่อให้ context ชัด
