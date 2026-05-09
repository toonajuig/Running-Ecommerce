import Link from 'next/link';
import { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const inStock = Number(product.total_stock) > 0;

  return (
    <Link href={`/products/${product.id}`}>
      <article className="overflow-hidden rounded-2xl border border-white/5 bg-surface-card transition hover:border-white/15 cursor-pointer">

        {/* Image area */}
        <div className="relative flex h-52 items-center justify-center bg-surface-deep">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl font-semibold text-ink-faint">
              {product.brand_name?.[0] ?? product.name[0]}
            </span>
          )}

          {!inStock && (
            <span className="absolute right-3 top-3 rounded-full bg-surface-deep px-2 py-0.5 text-xs text-red-400">
              Out of stock
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          {product.brand_name && (
            <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">
              {product.brand_name}
            </p>
          )}
          <h2 className="text-base font-medium text-ink">{product.name}</h2>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-semibold text-ink">
              ฿{Number(product.price).toLocaleString()}
            </span>

            {product.shoe_type && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-ink-muted">
                {product.shoe_type}
              </span>
            )}
          </div>
        </div>

      </article>
    </Link>
  );
}
