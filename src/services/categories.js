import { supabase } from "../lib/supabase";

/**
 * REAL SCHEMA — confirmed via the Supabase MCP connector against project
 * dtczmvbdaawnopdxqiax on 2026-07-07:
 *   id    uuid, primary key, default gen_random_uuid()
 *   name  text, nullable, unique
 *   color text, nullable
 *
 * There is NO foreign key between `projects` and `categories` — a
 * project's `category` column is plain text that's expected to match a
 * category's `name`. That means renaming or deleting a category doesn't
 * cascade automatically at the database level; the functions below do it
 * in application code instead (see updateCategory / deleteCategory).
 */

export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Categories + how many projects currently reference each one (matched
 * by name, since there's no category_id column on projects). Two plain
 * queries merged client-side rather than a DB view/RPC.
 */
export async function listCategoriesWithCounts() {
  const [{ data: categories, error: catError }, { data: rows, error: rowsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name, color").order("name", { ascending: true }),
      supabase.from("projects").select("category"),
    ]);

  if (catError) throw catError;
  if (rowsError) throw rowsError;

  const counts = {};
  (rows ?? []).forEach((row) => {
    if (row.category) counts[row.category] = (counts[row.category] ?? 0) + 1;
  });

  return (categories ?? []).map((category) => ({
    ...category,
    projectCount: counts[category.name] ?? 0,
  }));
}

export async function createCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: trimmed }])
    .select("id, name, color")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Renames a category and cascades the rename to every project currently
 * using the old name — since projects.category is plain text with no FK,
 * nothing does this automatically.
 */
export async function updateCategory(id, name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", id)
    .select("id, name, color")
    .single();
  if (error) throw error;

  if (existing.name && existing.name !== trimmed) {
    const { error: cascadeError } = await supabase
      .from("projects")
      .update({ category: trimmed })
      .eq("category", existing.name);
    if (cascadeError) throw cascadeError;
  }

  return data;
}

/**
 * Deletes a category. Projects using its name are first detached (set to
 * null) — there's no FK to enforce this, but leaving them pointed at a
 * name that no longer exists in `categories` would silently orphan them.
 */
export async function deleteCategory(id) {
  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  if (existing.name) {
    const { error: detachError } = await supabase
      .from("projects")
      .update({ category: null })
      .eq("category", existing.name);
    if (detachError) throw detachError;
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
