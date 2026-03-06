export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra mayúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe tener al menos un carácter especial.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const PASSWORD_REQUIREMENTS_TEXT = 'Mínimo 8 caracteres, incluyendo mayúsculas, números y caracteres especiales.';
