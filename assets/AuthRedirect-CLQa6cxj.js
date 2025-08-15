import{c as o,u as r}from"./index-Cz0ZLwjf.js";import{r as c}from"./vendor-CsPsgsBv.js";import{u,a as n}from"./router-J7O6VmFe.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=o("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);function p(){const e=u(),t=n(),{isAuthenticated:a}=r();return c.useEffect(()=>{if(a){const s=t.state?.from?.pathname||"/home";e(s,{replace:!0})}else e("/login",{state:{from:t},replace:!0})},[e,a,t]),null}export{p as A,l as M};
