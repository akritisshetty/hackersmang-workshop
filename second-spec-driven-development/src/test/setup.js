import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { apiOverrides } from '../api.js';

beforeEach(() => {
  localStorage.clear();
  apiOverrides.failLogin = false;
  apiOverrides.failItems = false;
  apiOverrides.failCart = false;
  apiOverrides.catalog = null;
});

afterEach(() => {
  cleanup();
});