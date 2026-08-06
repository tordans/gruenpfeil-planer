import{c as t,j as n}from"./index-2JJQuk1r.js";import{V as a}from"./evaluate-CyunS4_t.js";import{T as s}from"./steps-vocLcjk9.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=t("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o=t("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),l={zulaessig:{wrap:"bg-green-100 text-green-900 ring-green-300",icon:g},bedingt:{wrap:"bg-amber-100 text-amber-900 ring-amber-300",icon:s},unzulaessig:{wrap:"bg-red-100 text-red-900 ring-red-300",icon:o}};function d({verdict:e,size:r="lg"}){const c=l[e],i=c.icon;return n.jsxs("span",{className:`inline-flex items-center gap-2 rounded-lg font-semibold ring-1 ${c.wrap} ${r==="lg"?"px-4 py-2 text-lg":"px-2.5 py-1 text-sm"}`,children:[n.jsx(i,{size:r==="lg"?22:16}),a[e]]})}export{d as V};
