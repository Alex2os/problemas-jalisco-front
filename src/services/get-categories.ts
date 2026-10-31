import { apiRequest } from "./api";
import { apiCache } from "./cache";

export interface BackendCategory {
  id: string;
  name: string;
  description: string;
}

export interface GetCategoriesResponse {
  message: string;
  categories: BackendCategory[];
}

export const CATEGORIES_CACHE_KEY = "categories:official";

export async function getOfficialCategories(refresh = false): Promise<BackendCategory[]> {
  if (!refresh) {
    const cached = apiCache.peek<BackendCategory[]>(CATEGORIES_CACHE_KEY);
    if (cached) return cached;
  }

  const data = await apiRequest<GetCategoriesResponse>("/reports/categories", {}, "optional");
  if (!data || !Array.isArray(data.categories)) {
    throw new Error("El catálogo de categorías devuelto por el servidor tiene un formato inválido.");
  }

  apiCache.set(CATEGORIES_CACHE_KEY, data.categories);
  return data.categories;
}
