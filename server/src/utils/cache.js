const cache = new Map();

function getCache(key) {
  const cachedItem = cache.get(key);

  if (!cachedItem) {
    return null;
  }

  if (Date.now() > cachedItem.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cachedItem.data;
}

function setCache(key, data, duration = 30 * 1000) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + duration,
  });
}

function clearCache(key) {
  cache.delete(key);
}

module.exports = {
  getCache,
  setCache,
  clearCache,
};