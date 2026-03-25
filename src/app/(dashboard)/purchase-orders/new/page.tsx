"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = { id: string; name: string; sku: string; costPrice: number };
type Supplier = { id: string; name: string };
type POItem = { productId: string; quantity: number; unitCost: number };

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<POItem[]>([]);
  const [form, setForm] = useState({
    supplierId: searchParams.get("supplierId") ?? "",
    status: "draft",
    expectedDate: "",
    notes: "",
    tax: "0",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/suppliers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([s, p]) => { setSuppliers(s); setProducts(p); });
  }, []);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function addItem() { setItems((i) => [...i, { productId: "", quantity: 1, unitCost: 0 }]); }

  function updateItem(idx: number, key: keyof POItem, val: string | number) {
    setItems((items) => items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [key]: val };
      if (key === "productId") {
        const product = products.find((p) => p.id === val);
        if (product) updated.unitCost = product.costPrice;
      }
      return updated;
    }));
  }

  function removeItem(idx: number) { setItems((items) => items.filter((_, i) => i !== idx)); }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const taxAmt = subtotal * (parseFloat(form.tax) / 100);
  const total = subtotal + taxAmt;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    const poItems = items.map((i) => ({ ...i, total: i.quantity * i.unitCost }));
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId: form.supplierId,
        status: form.status,
        expectedDate: form.expectedDate ? new Date(form.expectedDate).toISOString() : null,
        notes: form.notes || null,
        subtotal, tax: taxAmt, total,
        items: { create: poItems },
      }),
    });
    if (res.ok) {
      const po = await res.json();
      router.push(`/purchase-orders/${po.id}`);
    } else { setLoading(false); }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/purchase-orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select required value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select supplier...</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" value={form.expectedDate} onChange={(e) => set("expectedDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Items</h2>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Item</button>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700">Add first item</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Product</label>}
                    <select value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                    <input type="number" min="1" value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>}
                    <input type="number" step="0.01" value={item.unitCost}
                      onChange={(e) => updateItem(idx, "unitCost", parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className="text-xs text-gray-500 py-2">{fmt(item.quantity * item.unitCost)}</span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Tax</span>
                    <input type="number" min="0" max="100" value={form.tax} onChange={(e) => set("tax", e.target.value)}
                      className="w-14 px-2 py-0.5 border border-gray-300 rounded text-xs text-center" />
                    <span>%</span>
                  </div>
                  <span>{fmt(taxAmt)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-100"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || items.length === 0}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? "Creating..." : "Create Purchase Order"}
          </button>
          <Link href="/purchase-orders" className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
