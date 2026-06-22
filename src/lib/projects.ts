import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

/** The implicit, always-first filter tab. */
export const ALL_CATEGORY = "All";

/**
 * All projects in canonical display order: by `order` ascending, then title
 * (case-insensitive) as a stable tiebreaker.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.data.title.localeCompare(b.data.title);
  });
}

/** Narrow an already-ordered list to a category. `'All'` returns it unchanged. */
export function filterByCategory(
  projects: Project[],
  category: string,
): Project[] {
  if (category === ALL_CATEGORY) return projects;
  return projects.filter((project) => project.data.category === category);
}
