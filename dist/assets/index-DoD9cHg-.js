import{d,a as m,k as u,j as e,B as l}from"./index-aayb8UKP.js";/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=d("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=d("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);function j({permission:s,fallback:a=null,children:r}){const{user:t}=m();return u(t,s)?r:a}function p({open:s,title:a,message:r,onConfirm:t,onCancel:i,isLoading:n,confirmLabel:c,confirmVariant:o="danger"}){return s?e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4",role:"dialog","aria-modal":"true",children:[e.jsx("div",{className:"absolute inset-0 bg-black/30 animate-fade-in",onClick:i,"aria-hidden":"true"}),e.jsxs("div",{className:"relative bg-surface rounded-xl border border-border shadow-elevated w-full max-w-sm p-6 animate-slide-up",children:[e.jsxs("div",{className:"flex gap-4",children:[e.jsx("div",{className:"w-10 h-10 rounded-lg bg-error-soft flex items-center justify-center shrink-0",children:e.jsx(x,{size:18,className:"text-error"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-semibold text-text-primary mb-1",children:a}),e.jsx("p",{className:"text-sm text-text-secondary",children:r})]})]}),e.jsxs("div",{className:"flex justify-end gap-2 mt-6",children:[e.jsx(l,{variant:"secondary",size:"sm",onClick:i,disabled:n,children:"إلغاء"}),e.jsx(l,{variant:o,size:"sm",onClick:t,isLoading:n,children:c||"تأكيد"})]})]})]}):null}export{p as C,j as P,f as a};
