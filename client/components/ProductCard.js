export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-lg border bg-white shadow-sm">
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image_url}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
        )}
        <p className="mt-3 text-xl font-bold">${Number(product.price).toFixed(2)}</p>
      </div>
    </article>
  );
}
