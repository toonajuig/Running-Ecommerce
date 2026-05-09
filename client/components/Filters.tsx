'use client';

import { Category, Brand } from '@/types';

interface FilterValues {
  category: string;
  brand: string;
  gender: string;
  sort: string;
  q: string;
}

interface FiltersProps {
  values: FilterValues;
  categories: Category[];
  brands: Brand[];
  onChange: (key: keyof FilterValues, value: string) => void;
  onReset: () => void;
}

const GENDERS = [
  { value: '', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
];

export default function Filters({ values, categories, brands, onChange, onReset }: FiltersProps) {
  const hasActiveFilter = values.category || values.brand || values.gender || values.q;

  return (
    <aside className="flex flex-col gap-8">

      {/* Search */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Search</p>
        <input
          type="text"
          value={values.q}
          onChange={(e) => onChange('q', e.target.value)}
          placeholder="Name or description…"
          className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink placeholder-ink-faint outline-none focus:border-white/30"
        />
      </div>

      {/* Category */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Category</p>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => onChange('category', '')}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !values.category
                  ? 'bg-ink text-surface-card'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => onChange('category', c.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  values.category === c.slug
                    ? 'bg-ink text-surface-card'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Brand</p>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => onChange('brand', '')}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                !values.brand
                  ? 'bg-ink text-surface-card'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All brands
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.slug}>
              <button
                onClick={() => onChange('brand', b.slug)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  values.brand === b.slug
                    ? 'bg-ink text-surface-card'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Gender */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Gender</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onChange('gender', g.value)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                values.gender === g.value
                  ? 'border-ink bg-ink text-surface-card'
                  : 'border-white/10 text-ink-muted hover:border-white/30 hover:text-ink'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Sort</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange('sort', s.value)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                values.sort === s.value
                  ? 'bg-ink text-surface-card'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilter && (
        <button
          onClick={onReset}
          className="rounded-full border border-white/10 py-2 text-sm text-ink-muted transition hover:border-white/30 hover:text-ink"
        >
          Clear filters
        </button>
      )}

    </aside>
  );
}
