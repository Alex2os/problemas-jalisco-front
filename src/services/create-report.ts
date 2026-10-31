import { apiRequest } from "./api";
import { apiCache } from "./cache";
import { appendPhotos, type SelectedPhoto } from "./report-media";
import type { Report } from "./types";

export async function CreateReport(
  type: string,
  description: string,
  latitude: number,
  longitude: number,
  photos: SelectedPhoto[] = [],
) {
  const values = { type, description: description.trim(), latitude, longitude };
  let body: string | FormData = JSON.stringify(values);
  if (photos.length) {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) =>
      form.append(key, String(value)),
    );
    await appendPhotos(form, photos);
    body = form;
  }
  try {
    return await apiRequest<{ report_id: number; report?: Report }>(
      photos.length ? "/reports/create-with-photos" : "/reports/create",
      { method: "POST", body },
      true,
    );
  } finally {
    // A lost response can follow a committed create; refresh before trying to publish again.
    apiCache.invalidate("reports:");
  }
}
