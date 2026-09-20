"use client";

import { useEffect, useState } from "react";
import { createCategory, deleteCategory } from "@/lib/admin";
import { fetchCategories } from "@/lib/products";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetchCategories()
      .then((d) => setCategories(d.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createCategory({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Category) {
    const count = window.confirm(
      `Delete "${c.name}"? Products in this category will keep their data but lose the link.`
    );
    if (!count) return;
    try {
      await deleteCategory(c._id);
      setCategories((prev) => prev.filter((x) => x._id !== c._id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const input =
    "h-11 w-full border border-line bg-white px-3 text-sm outline-none focus:border-muted";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        {categories.length} categories — shown in the store&apos;s category sections.
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="mt-8 border border-line bg-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Add category</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <input
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name *"
            required
          />
          <input
            className={input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-dark px-5 text-xs uppercase tracking-[0.15em] text-bg hover:bg-ink disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </form>

      {/* List */}
      <div className="mt-6 border border-line bg-white">
        {loading ? (
          <div className="h-32 animate-pulse bg-cream/40" />
        ) : (
          <ul className="divide-y divide-line/60">
            {categories.map((c) => (
              <li key={c._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    /shop?category={c.slug}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-xs text-red-600 underline underline-offset-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}