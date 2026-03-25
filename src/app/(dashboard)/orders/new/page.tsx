"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = { id: string; name: string; sku: string; salePrice: number; stockQty: number };
type Customer = { id: string; name: string };
type OrderItem = { productId: string; quantity: number; unitPrice: number; discount: number };

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [form, setForm] = useState({
    customerId: searchParams.get("customerId") ?? "",
    status: "pending",
    deliveryDate: "",
    notes: "",
    shippingAddr: "",
    tax: "0",
    discount: "0",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([c, p]) => { setCustomers(c); setProducts(p); });
  }, []);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function addItem() {
    setItems((i) => [...i, { productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
  }

  function updateItem(idx: number, key: keyof OrderItem, val: string | number) {
    setItems((items) => items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [key]: val };
      if (key === "productId") {
        const product = products.find((p) => p.id === val);
        if (product) updated.unitPrice = product.salePrice;
      }
      return updated;
    }));
  }

  function removeItem(idx: number) {
    setItems((items) => items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 - i.discount / 100), 0);
  const taxAmt = subtotal * (parseFloat(form.tax) / 100);
  const discountAmt = subtotal * (parseFloat(form.discount) / 100);
  const total = subtotal + taxAmt - discountAmt;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    const orderItems = items.map((i) => ({
      ...i,
      total: i.quantity * i.unitPrice * (1 - i.discount / 100),
    }));

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: form.customerId,
        status: form.status,
        deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : null,
        notes: form.notes || null,
        shippingAddr: form.shippingAddr || null,
        subtotal,
        tax: taxAmt,
        discount: discountAmt,
        total,
        items: { create: orderItems },
      }),
    });

    if (res.ok) {
      const o = await res.json();
      router.push(`/orders/${o.id}`);
    } else { setLoading(false); }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Sales Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select required value={form.customerId} onChange={(e) => set("customerId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select customer...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <input value={form.shippingAddr} onChange={(e) => set("shippingAddr", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
            <button type="button" onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              + Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-400 text-sm">No items added yet</p>
              <button type="button" onClick={addItem}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                Add first item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
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
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Price</label>}
                    <input type="number" step="0.01" value={item.unitPrice}
                      onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Total</label>}
                    <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                      {fmt(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600 p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <input type="number" min="0" max="100" value={form.tax}
                    onChange={(e) => set("tax", e.target.value)}
                    className="w-16 px-2 py-0.5 border border-gray-300 rounded text-xs text-center" />
                  <span>%</span>
                </div>
                <span>{fmt(taxAmt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  <input type="number" min="0" max="100" value={form.discount}
                    onChange={(e) => set("discount", e.target.value)}
                    className="w-16 px-2 py-0.5 border border-gray-300 rounded text-xs text-center" />
                  <span>%</span>
                </div>
                <span>-{fmt(discountAmt)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || items.length === 0}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? "Creating..." : "Create Order"}
          </button>
          <Link href="/orders"
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
