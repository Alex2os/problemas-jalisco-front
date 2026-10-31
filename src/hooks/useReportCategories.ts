import { useEffect, useState } from "react";
import {
  CATEGORIES_LIST,
  LOCAL_FALLBACK_CATEGORIES,
  mergeBackendCategories,
  type CategoryDefinition,
} from "@/constants/report-categories";
import { getOfficialCategories } from "@/services/get-categories";

export function useReportCategories() {
  const [categories, setCategories] = useState<CategoryDefinition[]>(CATEGORIES_LIST);
  const [loading, setLoading] = useState(false);
  const [isFromBackend, setIsFromBackend] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      setLoading(true);
      try {
        const backendData = await getOfficialCategories();
        if (isMounted && backendData?.length) {
          setCategories(mergeBackendCategories(backendData));
          setIsFromBackend(true);
        }
      } catch {
        // Fallback al catálogo local oficial ante desconexión o fallo de servidor
        if (isMounted) {
          setCategories(LOCAL_FALLBACK_CATEGORIES);
          setIsFromBackend(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, isFromBackend };
}

