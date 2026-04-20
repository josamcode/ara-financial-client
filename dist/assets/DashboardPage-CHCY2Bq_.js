import{d as c,u,a as y,j as e,E as b,f}from"./index-aayb8UKP.js";import{u as g}from"./useQuery-DFLJ6qQ-.js";import{P as j}from"./index-Cy59mKTQ.js";import{C as v}from"./index-AzLthJnu.js";import{L as k}from"./index-DdXvFhe6.js";import{f as l}from"./formatters-Mhjk2mUI.js";/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=c("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=c("Scale",[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=c("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.447.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=c("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);function d({label:s,value:a,icon:n,trend:t,isLoading:r}){return r?e.jsx(k,{}):e.jsxs(v,{padding:"md",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-text-secondary mb-1",children:s}),e.jsx("p",{className:"text-2xl font-bold text-text-primary",children:a})]}),e.jsx("div",{className:"w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center",children:e.jsx(n,{size:18,className:"text-primary"})})]}),t!==void 0&&e.jsxs("p",{className:`mt-3 text-xs font-medium ${t>=0?"text-success":"text-error"}`,children:[t>=0?"+":"",t,"%"]})]})}function P(){var m,x,p;const{t:s}=u(),{user:a}=y(),{data:n,isLoading:t,isError:r,refetch:h}=g({queryKey:["dashboard"],queryFn:()=>f.get("/dashboard"),retry:1}),i=(m=n==null?void 0:n.data)==null?void 0:m.financials,o=((x=a==null?void 0:a.tenant)==null?void 0:x.baseCurrency)||"EGP";return e.jsxs("div",{className:"animate-fade-in",children:[e.jsx(j,{title:`${s("dashboard.welcome")}, ${((p=a==null?void 0:a.name)==null?void 0:p.split(" ")[0])||""}`,subtitle:s("dashboard.subtitle")}),r&&e.jsx(b,{title:s("common.somethingWentWrong"),onRetry:h,className:"py-10"}),!r&&e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",children:[e.jsx(d,{label:s("dashboard.totalAssets"),value:i?l(i.totalAssets,o):"-",icon:w,isLoading:t}),e.jsx(d,{label:s("dashboard.totalLiabilities"),value:i?l(i.totalLiabilities,o):"-",icon:N,isLoading:t}),e.jsx(d,{label:s("dashboard.totalRevenue"),value:i?l(i.totalRevenue,o):"-",icon:E,isLoading:t}),e.jsx(d,{label:s("dashboard.totalExpenses"),value:i?l(i.totalExpenses,o):"-",icon:C,isLoading:t})]})]})}export{P as default};
