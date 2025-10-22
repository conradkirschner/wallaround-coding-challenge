// scripts/generators/prisma.ts
import type { FilterableMap } from '../../src/filtering/filterable';

function prismaScalarToTemplateType(
    s: string,
): 'string' | 'number' | 'boolean' | 'date' | 'unknown' {
    switch (s) {
        case 'String':   return 'string';
        case 'Boolean':  return 'boolean';
        case 'Int':
        case 'BigInt':
        case 'Float':
        case 'Decimal':  return 'number';
        case 'DateTime': return 'date';
        default:         return 'unknown';
    }
}

/** Build fields JSON for Prisma: nullable & enums from DMMF. */
export async function fieldsJsonForPrisma(
    entity: string,
    meta: Readonly<FilterableMap>,
): Promise<string> {
    const { Prisma } = await import('@prisma/client'); // ← only loads when prisma builder is used
    const dmmf = Prisma?.dmmf;
    if (!dmmf) {
        throw new Error('[filter-codegen] Prisma DMMF not found. Run `prisma generate` first.');
    }

    const model = dmmf.datamodel.models.find((m) => m.name === entity);
    if (!model) {
        throw new Error(`[filter-codegen] Prisma model "${entity}" not found in DMMF.`);
    }

    const enumMap = new Map<string, string[]>();
    for (const e of dmmf.datamodel.enums) {
        enumMap.set(e.name, e.values.map((v) => v.name));
    }

    const fieldMap = new Map(model.fields.map((f) => [f.name, f]));

    const arr = Object.entries(meta)
        .filter(([name]) => !name.includes('.'))
        .map(([name, def]) => {
            const pf = fieldMap.get(name);

            let type = def.type as string;
            let enumValues: string[] = def.enumValues ?? [];
            let nullable = true;

            if (pf) {
                if (pf.kind === 'enum') {
                    type = 'enum';
                    enumValues = enumMap.get(String(pf.type)) ?? enumValues;
                } else if (pf.kind === 'scalar') {
                    type = prismaScalarToTemplateType(String(pf.type));
                }
                nullable = !pf.isRequired;
            } else {
                // Missing in DMMF; keep def.type and nullable=true as a safe default.
            }

            return {
                name,
                type,
                operators: Array.isArray(def.operators) ? def.operators : [],
                enumValues,
                nullable,
            };
        });

    return JSON.stringify(arr);
}
