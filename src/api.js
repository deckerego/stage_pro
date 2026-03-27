const BASE = '/api';

export async function fetchScreens() {
  const res = await fetch(`${BASE}/v1/stage/screens`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchLayoutMap() {
  const res = await fetch(`${BASE}/v1/stage/layout_map`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchStageScreensStatus() {
  const res = await fetch(`${BASE}/v1/status/stage_screens`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function layoutThumbnailUrl(layoutUuid) {
  return `${BASE}/v1/stage/layout/${layoutUuid}/thumbnail`;
}
