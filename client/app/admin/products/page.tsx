'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Product, ProductDetail, Category, Brand, ProductVariant } from '@/types';

const EMPTY_FORM = {
  name: '', description: '', price: '', imageUrl: '',
  categoryId: '', brandId: '', gender: '', shoeType: '',
  weightGrams: '', dropMm: '',
};

export default function AdminProductsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [editing, setEditing]   = useState<ProductDetail | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [variantForm, setVariantForm] = useState({ size: '', sku: '', stock: '', priceOverride: '' });
  const [expandedId, setExpandedId]   = useState<number | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn:  () => api.get<{ items: Product[] }>('/products?limit=100').then(r => r.items),
    enabled:  !!token,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  () => api.get<Category[]>('/categories'),
    staleTime: Infinity,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn:  () => api.get<Brand[]>('/brands'),
    staleTime: Infinity,
  });

  // ดึง variants ของ product ที่ expand อยู่
  const { data: expandedProduct } = useQuery<ProductDetail>({
    queryKey: ['products', String(expandedId)],
    queryFn:  () => api.get<ProductDetail>(`/products/${expandedId}`),
    enabled:  expandedId != null,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowNew(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description ?? '', price: p.price,
      imageUrl: p.image_url ?? '', categoryId: String(p.category_slug),
      brandId: p.brand_slug ?? '', gender: p.gender ?? '',
      shoeType: p.shoe_type ?? '', weightGrams: String(p.weight_grams ?? ''),
      dropMm: String(p.drop_mm ?? ''),
    });
    // ดึง product detail เพื่อได้ categoryId/brandId จริง
    api.get<ProductDetail>(`/products/${p.id}`, { token: token! }).then(detail => {
      setEditing(detail);
    });
    setShowNew(true);
  };

  const handleSubmit = async () => {
    const body = {
      name: form.name, description: form.description || null,
      price: Number(form.price), imageUrl: form.imageUrl || null,
      categoryId: Number(form.categoryId), brandId: form.brandId ? Number(form.brandId) : null,
      gender: form.gender || null, shoeType: form.shoeType || null,
      weightGrams: form.weightGrams ? Number(form.weightGrams) : null,
      dropMm: form.dropMm ? Number(form.dropMm) : null,
    };

    if (editing) {
      await api.put(`/products/${editing.id}`, body, { token: token! });
    } else {
      await api.post('/products', body, { token: token! });
    }
    setShowNew(false);
    invalidate();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`, { token: token! });
    invalidate();
  };

  const handleAddVariant = async (productId: number) => {
    await api.post(`/admin/products/${productId}/variants`, {
      size: variantForm.size, sku: variantForm.sku,
      stock: Number(variantForm.stock),
      priceOverride: variantForm.priceOverride ? Number(variantForm.priceOverride) : null,
    }, { token: token! });
    setVariantForm({ size: '', sku: '', stock: '', priceOverride: '' });
    queryClient.invalidateQueries({ queryKey: ['products', String(productId)] });
  };

  const handleDeleteVariant = async (productId: number, variantId: number) => {
    await api.delete(`/admin/products/${productId}/variants/${variantId}`, { token: token! });
    queryClient.invalidateQueries({ queryKey: ['products', String(productId)] });
  };

  const handleUpdateVariantStock = async (productId: number, variantId: number, stock: number) => {
    await api.patch(`/admin/products/${productId}/variants/${variantId}`, { stock }, { token: token! });
    queryClient.invalidateQueries({ queryKey: ['products', String(productId)] });
  };

  if (isLoading) return <p className="text-ink-muted">Loading…</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        <button
          onClick={openNew}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
        >
          + Add product
        </button>
      </div>

      {/* Product form modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-surface-card p-8">
            <h2 className="mb-6 text-lg font-semibold text-ink">
              {editing ? 'Edit product' : 'New product'}
            </h2>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Name *', key: 'name' as const },
                { label: 'Description', key: 'description' as const },
                { label: 'Price (฿) *', key: 'price' as const },
                { label: 'Image URL', key: 'imageUrl' as const },
                { label: 'Weight (g)', key: 'weightGrams' as const },
                { label: 'Drop (mm)', key: 'dropMm' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-ink-faint">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink outline-none focus:border-white/30"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs text-ink-faint">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-ink-faint">Brand</label>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm(f => ({ ...f, brandId: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="">None</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-ink-faint">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink outline-none"
                  >
                    <option value="">None</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-ink-faint">Shoe type</label>
                  <select
                    value={form.shoeType}
                    onChange={(e) => setForm(f => ({ ...f, shoeType: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-ink outline-none"
                  >
                    <option value="">None</option>
                    <option value="road">Road</option>
                    <option value="trail">Trail</option>
                    <option value="track">Track</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-ink py-2.5 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
              >
                {editing ? 'Save changes' : 'Create'}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 rounded-full border border-white/10 py-2.5 text-sm text-ink-muted transition hover:border-white/30 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-2xl bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products?.map((p) => (
              <>
                <tr key={p.id} className="hover:bg-surface-deep transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">{p.name}</p>
                    {p.brand_name && <p className="text-xs text-ink-faint">{p.brand_name}</p>}
                  </td>
                  <td className="px-6 py-4 text-ink-muted">{p.category_name}</td>
                  <td className="px-6 py-4 text-ink">฿{Number(p.price).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="text-xs text-ink-muted transition hover:text-ink"
                      >
                        {expandedId === p.id ? 'Hide' : 'Variants'}
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs text-ink-muted transition hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-400 transition hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Variants panel */}
                {expandedId === p.id && (
                  <tr key={`${p.id}-variants`}>
                    <td colSpan={4} className="bg-surface-deep px-6 py-4">
                      <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Variants</p>

                      {/* Existing variants */}
                      {expandedProduct?.variants.map((v: ProductVariant) => (
                        <div key={v.id} className="mb-2 flex items-center gap-4">
                          <span className="w-16 text-sm text-ink">{v.size}</span>
                          <span className="w-32 text-xs text-ink-faint">{v.sku}</span>
                          <input
                            type="number"
                            defaultValue={v.stock}
                            className="w-20 rounded-lg border border-white/10 bg-surface-card px-2 py-1 text-sm text-ink outline-none"
                            onBlur={(e) => handleUpdateVariantStock(p.id, v.id, Number(e.target.value))}
                          />
                          <span className="text-xs text-ink-faint">stock</span>
                          <button
                            onClick={() => handleDeleteVariant(p.id, v.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Add variant form */}
                      <div className="mt-4 flex gap-2">
                        {(['size', 'sku', 'stock', 'priceOverride'] as const).map((key) => (
                          <input
                            key={key}
                            value={variantForm[key]}
                            onChange={(e) => setVariantForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder={key === 'priceOverride' ? 'price override' : key}
                            className="w-24 rounded-lg border border-white/10 bg-surface-card px-2 py-1 text-xs text-ink outline-none focus:border-white/30"
                          />
                        ))}
                        <button
                          onClick={() => handleAddVariant(p.id)}
                          className="rounded-lg bg-ink px-3 py-1 text-xs text-surface-card hover:bg-ink-muted"
                        >
                          Add
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
