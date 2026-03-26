const LOGIN_PROTECTION_STORAGE_KEY = "bit_ween.auth.login_protection";

const ONE_SECOND = 1000;
const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export const LOGIN_PROTECTION_STATUS = {
  ALLOWED: "allowed",
  DELAYED: "delayed",
  LOCKED_SHORT: "locked_short",
  LOCKED_LONG: "locked_long",
  SUSPENDED: "suspended",
};

const safeParse = (raw, fallback) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const readProtectionStore = () => {
  if (!canUseStorage()) return {};
  const raw = window.localStorage.getItem(LOGIN_PROTECTION_STORAGE_KEY);
  return safeParse(raw, {});
};

const writeProtectionStore = (store) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOGIN_PROTECTION_STORAGE_KEY, JSON.stringify(store));
};

const normalizeEntry = (entry, now) => {
  const failedCount = Number(entry?.failedCount ?? 0);
  const lockedUntil = Number(entry?.lockedUntil ?? 0);
  const updatedAt = Number(entry?.updatedAt ?? 0);
  const suspended = Boolean(entry?.suspended);

  if (!failedCount && !lockedUntil && !suspended) {
    return {
      failedCount: 0,
      lockedUntil: 0,
      suspended: false,
      updatedAt: now,
    };
  }

  if (!suspended && updatedAt > 0 && now - updatedAt > THIRTY_DAYS) {
    return {
      failedCount: 0,
      lockedUntil: 0,
      suspended: false,
      updatedAt: now,
    };
  }

  return {
    failedCount: Number.isFinite(failedCount) ? Math.max(0, Math.floor(failedCount)) : 0,
    lockedUntil: Number.isFinite(lockedUntil) ? Math.max(0, lockedUntil) : 0,
    suspended,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : now,
  };
};

const getEntry = (email, now = Date.now()) => {
  if (!email) {
    return {
      failedCount: 0,
      lockedUntil: 0,
      suspended: false,
      updatedAt: now,
    };
  }

  const store = readProtectionStore();
  const entry = normalizeEntry(store[email], now);

  if (entry.lockedUntil > 0 && entry.lockedUntil <= now) {
    entry.lockedUntil = 0;
  }

  return entry;
};

const setEntry = (email, entry) => {
  if (!email || !canUseStorage()) return;
  const store = readProtectionStore();
  store[email] = entry;
  writeProtectionStore(store);
};

const removeEntry = (email) => {
  if (!email || !canUseStorage()) return;
  const store = readProtectionStore();
  if (!(email in store)) return;
  delete store[email];
  writeProtectionStore(store);
};

const buildProtectionResult = (entry, now = Date.now()) => {
  if (entry.suspended || entry.failedCount >= 15) {
    return {
      status: LOGIN_PROTECTION_STATUS.SUSPENDED,
      delayMs: 0,
      remainingMs: 0,
      failedCount: entry.failedCount,
    };
  }

  if (entry.lockedUntil > now) {
    return {
      status:
        entry.failedCount >= 10
          ? LOGIN_PROTECTION_STATUS.LOCKED_LONG
          : LOGIN_PROTECTION_STATUS.LOCKED_SHORT,
      delayMs: 0,
      remainingMs: entry.lockedUntil - now,
      failedCount: entry.failedCount,
    };
  }

  if (entry.failedCount >= 3) {
    return {
      status: LOGIN_PROTECTION_STATUS.DELAYED,
      delayMs: ONE_SECOND,
      remainingMs: 0,
      failedCount: entry.failedCount,
    };
  }

  return {
    status: LOGIN_PROTECTION_STATUS.ALLOWED,
    delayMs: 0,
    remainingMs: 0,
    failedCount: entry.failedCount,
  };
};

export const getLoginProtection = (email, now = Date.now()) => {
  const entry = getEntry(email, now);
  return buildProtectionResult(entry, now);
};

export const registerLoginFailure = (email, now = Date.now()) => {
  const current = getEntry(email, now);
  const failedCount = current.failedCount + 1;

  const nextEntry = {
    failedCount,
    lockedUntil: 0,
    suspended: false,
    updatedAt: now,
  };

  if (failedCount >= 15) {
    nextEntry.suspended = true;
  } else if (failedCount >= 10) {
    nextEntry.lockedUntil = now + FIFTEEN_MINUTES;
  } else if (failedCount >= 5) {
    nextEntry.lockedUntil = now + FIVE_MINUTES;
  }

  setEntry(email, nextEntry);

  return buildProtectionResult(nextEntry, now);
};

export const resetLoginFailures = (email) => {
  removeEntry(email);
};
