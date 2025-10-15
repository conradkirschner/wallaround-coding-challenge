import * as React from 'react';
import { type Schema, type FilterNode } from 'filter-builder-core';
import { pretty, safeParseJSON } from '../utils/json';

export function useFilterState(schemaApi: { validate: (n: FilterNode)=>{valid:boolean;issues:string[]}, decode: (n:FilterNode)=>FilterNode }, initialTree: FilterNode) {
    const [tree, setTree] = React.useState<FilterNode>(initialTree);

    const decoded = React.useMemo(() => schemaApi.decode(tree), [schemaApi, tree]);

    const [canonDraft, setCanonDraft] = React.useState(() => pretty(decoded));
    const [canonError, setCanonError] = React.useState<string | null>(null);
    const [canonDirty, setCanonDirty] = React.useState(false);

    React.useEffect(() => {
        if (!canonDirty) { setCanonDraft(pretty(decoded)); setCanonError(null); }
    }, [decoded, canonDirty]);

    const onCanonChange = (s: string) => { setCanonDirty(true); setCanonDraft(s); };

    const applyCanon = () => {
        const parsed = safeParseJSON<FilterNode>(canonDraft);
        if (!parsed.ok) return setCanonError(parsed.error);
        const res = schemaApi.validate(parsed.value);
        if (!res.valid) return setCanonError(res.issues.join('\n'));
        const normalized = schemaApi.decode(parsed.value);
        setTree(normalized);
        setCanonDraft(pretty(normalized));
        setCanonError(null);
        setCanonDirty(false);
    };

    const resetCanon = () => { setCanonDraft(pretty(decoded)); setCanonError(null); setCanonDirty(false); };

    return { tree, setTree, decoded, canonDraft, onCanonChange, applyCanon, resetCanon, canonError, canonDirty };
}
