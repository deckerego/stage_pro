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

export async function* streamStatusUpdates(endpoints, signal) {
  const res = await fetch(`${BASE}/v1/status/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(endpoints),
    signal,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        try {
          yield JSON.parse(trimmed);
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
