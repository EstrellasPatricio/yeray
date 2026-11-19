const DEFAULT_API_BASE_URL = 'http://localhost:3000';

/** URL base de la API principal, compartida por autenticación y reputación. */
export const apiBaseUrl = import.meta.env.WXT_API_BASE_URL || DEFAULT_API_BASE_URL;
