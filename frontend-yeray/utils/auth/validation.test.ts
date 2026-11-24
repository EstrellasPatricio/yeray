import { describe, expect, it } from 'vitest';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  hasErrors,
  validateCredentials,
  validateEmail,
  validatePassword,
} from './validation';

describe('validateEmail', () => {
  it('pide el correo si está vacío o solo tiene espacios', () => {
    expect(validateEmail('')).toBe('Introduce tu correo electrónico.');
    expect(validateEmail('   ')).toBe('Introduce tu correo electrónico.');
  });

  it.each(['ana', 'ana@', '@uma.es', 'ana@uma', 'ana uma@uma.es', 'ana@@uma.es'])(
    'rechaza el formato no válido %s',
    (email) => {
      expect(validateEmail(email)).toMatch(/correo electrónico válido/);
    },
  );

  it('acepta correos válidos e ignora espacios exteriores', () => {
    expect(validateEmail('ana@uma.es')).toBeUndefined();
    expect(validateEmail('  ana.perez+yerai@alumnos.uma.es  ')).toBeUndefined();
  });

  it('rechaza correos de más de 254 caracteres', () => {
    expect(validateEmail(`${'a'.repeat(250)}@uma.es`)).toMatch(/correo electrónico válido/);
  });
});

describe('validatePassword', () => {
  it('al iniciar sesión solo exige que no esté vacía', () => {
    expect(validatePassword('', 'signin')).toBe('Introduce tu contraseña.');
    expect(validatePassword('abc', 'signin')).toBeUndefined();
  });

  it('al crear cuenta exige longitud mínima', () => {
    expect(validatePassword('', 'register')).toBe('Introduce tu contraseña.');
    expect(validatePassword('abc1234', 'register')).toBe(
      `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    );
  });

  it('al crear cuenta limita la longitud máxima', () => {
    const long = `a1${'b'.repeat(PASSWORD_MAX_LENGTH)}`;
    expect(validatePassword(long, 'register')).toBe(
      `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
    );
  });

  it('al crear cuenta exige al menos una letra y un número', () => {
    const message = 'La contraseña debe incluir al menos una letra y un número.';
    expect(validatePassword('abcdefgh', 'register')).toBe(message);
    expect(validatePassword('12345678', 'register')).toBe(message);
    expect(validatePassword('contraseña1', 'register')).toBeUndefined();
  });
});

describe('validateCredentials', () => {
  it('devuelve los errores de cada campo', () => {
    const errors = validateCredentials({ email: 'mal', password: '' }, 'signin');
    expect(errors.email).toBeDefined();
    expect(errors.password).toBe('Introduce tu contraseña.');
    expect(hasErrors(errors)).toBe(true);
  });

  it('no devuelve errores con datos válidos', () => {
    const errors = validateCredentials({ email: 'ana@uma.es', password: 'segura123' }, 'register');
    expect(errors).toEqual({});
    expect(hasErrors(errors)).toBe(false);
  });
});
