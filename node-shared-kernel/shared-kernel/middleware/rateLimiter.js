const requests = new Map();

export function rateLimiter(limit, windowSeconds) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    if (!requests.has(ip)) requests.set(ip, []);
    const timestamps = requests.get(ip).filter(ts => ts > windowStart);

    if (timestamps.length >= limit) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    timestamps.push(now);
    requests.set(ip, timestamps);
    next();
  };
}
