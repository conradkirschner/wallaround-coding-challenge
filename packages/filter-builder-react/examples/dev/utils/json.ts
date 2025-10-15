export type JsonResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function safeParseJSON<T>(input: string): JsonResult<T> {
    try {
        return { ok: true, value: JSON.parse(input) as T };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export const pretty = (v: unknown) => JSON.stringify(v, null, 2);
