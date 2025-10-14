import * as React from 'react';
import type { FilterNode, Schema, FieldOption, ValueType } from 'filter-builder-core';
import { findField, findOperator } from 'filter-builder-core';

export function ConditionRow({ schema, node, onChange }: { schema: Schema; node: Extract<FilterNode, {field: string}>; onChange: (n: FilterNode) => void }) {
  const set = (patch: Partial<Extract<FilterNode,{field:string}>>) => onChange({ ...node, ...patch });
  const field = findField(schema, node.field);
  const operator = findOperator(schema, node.operator);
  const valueArity = operator?.valueArity ?? 'one';

  return (
    <div className="fb-condition">
      <label className="fb-inline">
        <span className="fb-label">Field</span>
        <select aria-label="Field" value={node.field} onChange={(e) => set({ field: e.target.value })}>
          {schema.fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
      </label>

      <label className="fb-inline">
        <span className="fb-label">Operator</span>
        <select aria-label="Operator" value={node.operator} onChange={(e) => set({ operator: e.target.value })}>
          {(field ? schema.operators.filter(o => o.supportedTypes.includes(field.type)) : schema.operators)
            .map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </label>

      {valueArity === 'none' ? null :
        valueArity === 'one' ? <SingleValue fieldType={field?.type} options={field?.options ?? []} value={node.value} onChange={(v) => set({ value: v })} /> :
        valueArity === 'two' ? <BetweenValue fieldType={field?.type} value={Array.isArray(node.value) ? node.value : []} onChange={(v) => set({ value: v })} /> :
        <ManyValues fieldType={field?.type} values={Array.isArray(node.value) ? node.value : []} onChange={(v) => set({ value: v })} />
      }
    </div>
  );
}

function SingleValue({ fieldType, options, value, onChange }:
  { fieldType?: ValueType; options: ReadonlyArray<FieldOption>; value: unknown; onChange: (v: unknown) => void }) {
  if (fieldType === 'boolean') return (
    <label className="fb-inline"><span className="fb-label">Value</span><input aria-label="Value" type="checkbox" checked={Boolean(value)} onChange={(e)=>onChange(e.currentTarget.checked)} /></label>
  );
  if (fieldType === 'number') return (
    <label className="fb-inline"><span className="fb-label">Value</span><input aria-label="Value" type="number" value={value==null?'':String(value)} onChange={(e)=>onChange(e.target.value===''?undefined:Number(e.target.value))} /></label>
  );
  if (fieldType === 'date') return (
    <label className="fb-inline"><span className="fb-label">Value</span><input aria-label="Value" type="date" value={typeof value==='string'?value:''} onChange={(e)=>onChange(e.target.value||undefined)} /></label>
  );
  if (options.length>0) return (
    <label className="fb-inline"><span className="fb-label">Value</span><select aria-label="Value" value={typeof value==='string'?value:''} onChange={(e)=>onChange(e.target.value||undefined)}><option value="">—</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
  );
  return (
    <label className="fb-inline"><span className="fb-label">Value</span><input aria-label="Value" type="text" value={typeof value==='string'?value:''} onChange={(e)=>onChange(e.target.value)} /></label>
  );
}

function BetweenValue({ fieldType, value, onChange }:
  { fieldType?: ValueType; value: ReadonlyArray<unknown>; onChange: (v: ReadonlyArray<unknown>) => void }) {
  const a = value[0];
  const b = value[1];
  const type = fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text';
  return (
    <span className="fb-inline">
      <span className="fb-label">Between</span>
      <input aria-label="From" type={type} value={a==null?'':String(a)} onChange={(e)=>onChange([cast(fieldType,e.target.value), b])} />
      <span style={{margin:'0 6px'}}>and</span>
      <input aria-label="To" type={type} value={b==null?'':String(b)} onChange={(e)=>onChange([a, cast(fieldType,e.target.value)])} />
    </span>
  );
}

function ManyValues({ fieldType, values, onChange }:
  { fieldType?: ValueType; values: ReadonlyArray<unknown>; onChange: (v: ReadonlyArray<unknown>) => void }) {
  const [text, setText] = React.useState<string>('');
  const add = () => { if (text==='') return; onChange([...values, cast(fieldType, text)]); setText(''); };
  return (
    <span className="fb-inline">
      <span className="fb-label">Values</span>
      <input aria-label="New value" type={fieldType==='number'?'number':'text'} value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') add(); }} />
      <button type="button" className="fb-btn" onClick={add}>Add</button>
      <ul className="fb-list">
        {values.map((v, i)=><li key={i}><code>{String(v)}</code><button type="button" className="fb-btn danger" onClick={()=>onChange(values.filter((_,idx)=>idx!==i))}>×</button></li>)}
      </ul>
    </span>
  );
}

const cast = (type: ValueType | undefined, raw: string): unknown => type==='number' ? Number(raw) : raw;
