const TOKEN_KEY = 'dep_token';  // dep = digital essentials platform

export const tokenUtils = {

  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  exists: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};