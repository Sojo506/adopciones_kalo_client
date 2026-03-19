const inFlightRequests = new Map();

export const dedupeRequest = (key, requestFactory) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const request = Promise.resolve()
    .then(requestFactory)
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
};
