import{d,u as p,a as u,j as e,E as h,f as y}from"./index-BAFVt89_.js";import{u as b}from"./useQuery-8nmpw09V.js";import{P as g}from"./index-BCa_0655.js";import{C as j}from"./index-DCdLFfhW.js";import{L as f}from"./index-BeqIxYOq.js";import{f as n}from"./formatters-BPb_S_kG.js";/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=d("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=d("Scale",[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=d("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=d("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);function l({label:s,value:i,icon:r,trend:t,isLoading:o}){return o?e.jsx(f,{}):e.jsxs(j,{padding:"md",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-secondary mb-1",children:s}),e.jsx("p",{className:"text-2xl font-bold text-text-primary",children:i})]}),e.jsx("div",{className:"w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center",children:e.jsx(r,{size:18,className:"text-primary"})})]}),t!==void 0&&e.jsxs("p",{className:`mt-3 text-xs font-medium ${t>=0?"text-success":"text-error"}`,children:[t>=0?"+":"",t,"%"]})]})}function T(){var c,m;const{t:s}=p(),{user:i}=u(),{data:r,isLoading:t,isError:o,refetch:x}=b({queryKey:["dashboard"],queryFn:()=>y.get("/dashboard"),retry:1}),a=(c=r==null?void 0:r.data)==null?void 0:c.summary;return e.jsxs("div",{className:"animate-fade-in",children:[e.jsx(g,{title:`${s("dashboard.welcome")}، ${((m=i==null?void 0:i.name)==null?void 0:m.split(" ")[0])||""}`,subtitle:s("dashboard.subtitle")}),o&&e.jsx(h,{title:s("common.somethingWentWrong"),onRetry:x,className:"py-10"}),!o&&e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",children:[e.jsx(l,{label:s("dashboard.totalAssets"),value:a?n(a.totalAssets,"EGP"):"—",icon:v,isLoading:t}),e.jsx(l,{label:s("dashboard.totalLiabilities"),value:a?n(a.totalLiabilities,"EGP"):"—",icon:k,isLoading:t}),e.jsx(l,{label:s("dashboard.totalRevenue"),value:a?n(a.totalRevenue,"EGP"):"—",icon:E,isLoading:t}),e.jsx(l,{label:s("dashboard.totalExpenses"),value:a?n(a.totalExpenses,"EGP"):"—",icon:w,isLoading:t})]})]})}export{T as default};
