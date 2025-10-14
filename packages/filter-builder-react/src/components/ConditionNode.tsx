import * as React from 'react';
import type {
    Schema,
    Field,
    OperatorDef,
    FilterNode,
    ValueType,
} from 'filter-builder-core';
import { ValueEditor } from './ValueEditor';

type ConditionNode = Extract<FilterNode, { field: string; operator: string; value?: unknown }>;

export type ConditionNodeEditorProps = {
    node: ConditionNode;
    schema: Schema;
    onChange: (next: ConditionNode) => void;
    onRemove?: () => void;
};

/** Normalize a value to match the operator’s valueArity. */
function normalizeValueForArity(
    prev: unknown,
    arity: OperatorDef['valueArity'],
): unknown {
    switch (arity) {
        case 'none':
            return undefined;
        case 'one':
            return Array.isArray(prev) || prev === undefined || prev === null ? '' : prev;
        case 'two':
            return Array.isArray(prev) && prev.length === 2 ? prev : ['', ''];
        case 'many':
            return Array.isArray(prev) ? prev : [];
    }
}

export const ConditionNodeEditor: React.FC<ConditionNodeEditorProps> = ({
                                                                            node,
                                                                            schema,
                                                                            onChange,
                                                                            onRemove,
                                                                        }) => {
    const fields = schema.fields;
    const field = React.useMemo<Field | undefined>(
        () => fields.find((f) => f.key === node.field),
        [fields, node.field],
    );

    // If schema has no fields, render a guard row
    if (!fields.length) {
        return (
            <div className="rounded-md border p-3 bg-amber-50 text-amber-900 text-xs">
                No fields configured in schema.
            </div>
        );
    }

    // If the field was removed or renamed, fall back to the first available field
    const effectiveField: Field = field ?? fields[0];

    // Compute operators compatible with the current field type
    const compatibleOps = React.useMemo<OperatorDef[]>(
        () => schema.operators.filter((o) => o.supportedTypes.includes(effectiveField.type)),
        [schema.operators, effectiveField.type],
    );

    // If there are truly no operators for this field type, render a guard row
    if (compatibleOps.length === 0) {
        return (
            <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Condition</div>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
                            aria-label="Remove condition"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    No operators available for type “{effectiveField.type}”. Adjust your operator map.
                </div>
            </div>
        );
    }

    // Try to use current operator if it’s compatible; otherwise pick the first compatible one.
    const currentOp: OperatorDef =
        compatibleOps.find((o) => o.key === node.operator) ?? compatibleOps[0];

    // Auto-heal when field changes or operator becomes incompatible
    React.useEffect(() => {
        // If field changed under us (e.g. via JSON) ensure node.field matches effective field
        if (node.field !== effectiveField.key || node.operator !== currentOp.key) {
            onChange({
                field: effectiveField.key,
                operator: currentOp.key,
                value: normalizeValueForArity(node.value, currentOp.valueArity),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveField.key, currentOp.key]);

    // Handlers ----------------------------------------------------
    const onFieldChange = (key: string) => {
        const nextField = fields.find((f) => f.key === key) ?? fields[0];
        const nextOps = schema.operators.filter((o) => o.supportedTypes.includes(nextField.type));
        const nextOp = nextOps[0];
        onChange({
            field: nextField.key,
            operator: nextOp.key,
            value: normalizeValueForArity(undefined, nextOp.valueArity),
        });
    };

    const onOperatorChange = (key: string) => {
        const nextOp = compatibleOps.find((o) => o.key === key) ?? currentOp;
        onChange({
            field: effectiveField.key,
            operator: nextOp.key,
            value: normalizeValueForArity(node.value, nextOp.valueArity),
        });
    };

    const onValueChange = (nextVal: unknown) => {
        onChange({
            field: effectiveField.key,
            operator: currentOp.key,
            value: nextVal,
        });
    };

    // UI ----------------------------------------------------------
    return (
        <div className="rounded-md border p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Condition</div>
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-md border px-2 py-1 text-xs text-red-700 border-red-200 hover:bg-red-50"
                        aria-label="Remove condition"
                    >
                        Remove
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* Field select */}
                <div>
                    <label htmlFor="field" className="sr-only">Field</label>
                    <select
                        id="field"
                        className="rounded-md border px-2 py-1 text-sm bg-white min-w-[10rem]"
                        value={effectiveField.key}
                        onChange={(e) => onFieldChange(e.target.value)}
                        aria-label="Field"
                    >
                        {fields.map((f) => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                    </select>
                </div>

                {/* Operator select */}
                <div>
                    <label htmlFor="op" className="sr-only">Operator</label>
                    <select
                        id="op"
                        className="rounded-md border px-2 py-1 text-sm bg-white min-w-[10rem]"
                        value={currentOp.key}
                        onChange={(e) => onOperatorChange(e.target.value)}
                        aria-label="Operator"
                    >
                        {compatibleOps.map((o) => (
                            <option key={o.key} value={o.key}>{o.label ?? o.key}</option>
                        ))}
                    </select>
                </div>

                {/* Value editor – safe: we always pass a valid OperatorDef */}
                <ValueEditor
                    id={`val-${effectiveField.key}`}
                    schema={schema}
                    field={effectiveField}
                    operator={currentOp}
                    value={node.value}
                    onChange={onValueChange}
                />
            </div>
        </div>
    );
};
