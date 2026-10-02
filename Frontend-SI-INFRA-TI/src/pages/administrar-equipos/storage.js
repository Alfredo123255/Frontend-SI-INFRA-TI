export function loadFromStorage(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage no disponible (modo privado, cuota llena, etc.) — se ignora.
  }
}
