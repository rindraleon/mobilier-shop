import { Transform } from 'class-transformer';

/**
 * Raccourci typé pour @Transform de class-transformer.
 * Évite les erreurs de typage sur les objets `{ value }` non génériques.
 */
export function ApplyTransform<T>(fn: (params: { value: T }) => unknown): PropertyDecorator {
  return Transform((params) => fn({ value: params.value as T })) as PropertyDecorator;
}
