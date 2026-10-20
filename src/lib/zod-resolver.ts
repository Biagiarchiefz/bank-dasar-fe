// Minimal Zod adapter for React Hook Form. It maps every Zod issue to the
// field path React Hook Form expects ("items.0.quantity" -> nested errors).

import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

function setPath(target: Record<string, unknown>, path: PropertyKey[], value: unknown) {
  let node = target;
  path.forEach((key, i) => {
    const k = String(key);
    if (i === path.length - 1) {
      if (node[k] === undefined) node[k] = value; // keep the first message per field
      return;
    }
    node[k] = (node[k] as Record<string, unknown>) ?? {};
    node = node[k] as Record<string, unknown>;
  });
}

export function zodResolver<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
): Resolver<z.input<TSchema>, unknown, z.output<TSchema>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.length > 0 ? issue.path : ["root"];
      setPath(errors, path, { type: issue.code, message: issue.message });
    }
    return { values: {}, errors: errors as FieldErrors<z.input<TSchema>> };
  };
}
