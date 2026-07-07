import { supabase } from "../lib/supabase";

/**
 * ASSUMED SCHEMA — adjust here if your live `categories` table differs:
 *   id         uuid, primary key
 *   name       text
 *   created_at timestamptz
 */

export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Categories + how many projects currently reference each one. Two plain
 * queries merged client-side rather than a DB view/RPC, since project
 * counts are cheap at this scale and this avoids depending on any
 * server-side aggregation being set up.
 */
export async function listCategoriesWithCounts() {
  const [{ data: categories, error: catError }, { data: rows, error: rowsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("name", { ascending: true }),
      supabase.from("projects").select("category_id"),
    ]);

  if (catError) throw catError;
  if (rowsError) throw rowsError;

  const counts = {};
  (rows ?? []).forEach((row) => {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  });

  return (categories ?? []).map((category) => ({
    ...category,
    projectCount: counts[category.id] ?? 0,
  }));
}

export async function createCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: trimmed }])
    .select("id, name")
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Category name can't be empty.");

  const { data, error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", id)
    .select("id, name")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes a category. Projects referencing it are first detached
 * (category_id set to null) so this can't fail on a foreign-key
 * constraint and doesn't silently orphan rows either.
 */
export async function deleteCategory(id) {
  const { error: detachError } = await supabase
    .from("projects")
    .update({ category_id: null })
    .eq("category_id", id);

  if (detachError) throw detachError;

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
