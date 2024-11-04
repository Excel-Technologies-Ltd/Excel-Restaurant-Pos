import{r as i,R as k,j as o,s as e,L as E,i as w,H as I,F as T,A}from"./index-Bu8ZlXvv.js";const D=({data:l,buttonTitle:x,titleClass:p="",itemClass:c="",boxClass:r="",isItemTop:d="right-0 bottom-10",id:n=""})=>{const[u,h]=i.useState(!1),j=()=>{h(s=>!s)},v=s=>{s(),h(a=>!a)},N=()=>{h(s=>!s)},b=n==null?void 0:n.split(" "),t=(b==null?void 0:b[0])+b[1]+n;k.useEffect(()=>{const s=a=>{const C=a.target;u!==!1&&!C.closest(`.dropdown-container${t}`)&&h(!1)};return document.addEventListener("mousedown",s),()=>{document.removeEventListener("mousedown",s)}},[u]);const g=" text-start border-b border-borderColor hover:bg-borderColor flex items-center justify-start gap-2 text-[11px] 2xl:text-[13px] px-4 py-[9px] 2xl:py-[11px]",y=d||"right-0 top-10";return o.jsx("div",{className:"flex-none gap-2",children:o.jsxs("div",{className:" relative w-fit",children:[o.jsx("div",{role:"button",className:e(`bg-white w-fit min-w-24 rounded-lg text-[11px] 2xl:text-[13px] px-4 py-[9px] 2xl:py-[11px] dropdown-container${t}`,p),onClick:j,children:o.jsx("div",{children:x})}),u&&o.jsx("ul",{className:e(`absolute z-50 shadow menu menu-sm bg-base-100 rounded-md w-fit min-w-40 bg-white text-textColor overflow-y-auto dropdown-container${t}`,y,r),children:o.jsxs("div",{className:" max-h-[400px] flex flex-col",children:[(l==null?void 0:l.length)==0&&o.jsx("div",{className:"p-3",children:"Items not found"}),l==null?void 0:l.map((s,a)=>{if(s!=null&&s.disabled)return o.jsxs("button",{type:"button",className:e("bg-borderColor cursor-not-allowed whitespace-nowrap",g,c,s!=null&&s.className?s==null?void 0:s.className:""),children:[s==null?void 0:s.icon,s==null?void 0:s.label]},a);if(s!=null&&s.link)return o.jsxs(E,{onClick:N,to:s==null?void 0:s.link,className:e("whitespace-nowrap",g,c,s!=null&&s.className?s==null?void 0:s.className:""),children:[s==null?void 0:s.icon,s==null?void 0:s.label]},a);if(s!=null&&s.button)return o.jsxs("button",{onClick:()=>{v(s==null?void 0:s.button)},type:"button",className:e("whitespace-nowrap",g,c,s!=null&&s.className?s==null?void 0:s.className:""),children:[s==null?void 0:s.icon,s==null?void 0:s.label]},a)})]})})]})})},O=({children:l,className:x=""})=>o.jsx("div",{className:"overflow-x-auto bg-white rounded-lg",children:o.jsx("div",{className:e(" w-full min-w-[900px] pb-5",x),children:l})});function L({data:l,index:x,className:p="",rowColor:c=""}){const d=`${100/l.length}%`;return o.jsx("div",{className:e("flex justify-between items-center px-6 h-full border-b border-borderColor bg-white last:border-none",{"odd:bg-borderColor":c},p),children:l==null?void 0:l.map((n,u)=>o.jsx("div",{className:e("p-2 text-textColor text-[11px] 2xl:text-[13px] ",n!=null&&n.dataClass?n==null?void 0:n.dataClass:"",{"sticky right-0 bg-white h-full":n==null?void 0:n.isAction},{"odd:bg-borderColor":c}),style:{width:n.w||d},children:o.jsx("div",{className:"flex flex-col",children:o.jsx("div",{className:"text-[11px] 2xl:text-[13px] text-grayColor font-normal",children:n==null?void 0:n.value})})},u))},x)}function P({data:l,className:x=""}){const c=`${100/(l==null?void 0:l.length)}%`;return o.jsx("div",{className:e("flex justify-between px-6 h-full border-b border-borderColor py-[6px] bg-grayTextColor text-white",x),children:l==null?void 0:l.map((r,d)=>o.jsx("p",{className:e("p-2 py-2.5 text-[12px] 2xl:text-[14px] font-semibold text-start",{"sticky right-0 bg-grayTextColor h-full":r==null?void 0:r.isAction},{"py-[18px]":(r==null?void 0:r.heading)===""}),style:{width:(r==null?void 0:r.w)||c},children:r==null?void 0:r.heading},d))})}const $=({})=>{var l,x;return console.log({items:w}),o.jsx("div",{className:"p-4",children:o.jsxs(O,{className:"min-w-[920px] bg-white",children:[o.jsx(P,{data:f()}),(x=(l=w)==null?void 0:l.slice(0,3))==null?void 0:x.map((p,c)=>o.jsx(L,{data:f(p),index:c},c))]})})},f=l=>[{heading:"Name",value:o.jsx(o.Fragment,{children:(l==null?void 0:l.name)||"--"}),w:"170px"},{heading:"Description",value:(l==null?void 0:l.description)||"--",w:"250px"},{heading:"Price",value:"৳ "+(l==null?void 0:l.sellPrice)||"--",w:""},{heading:"Quantity",value:(l==null?void 0:l.quantity)||"1",w:""},{heading:"TotalPrice",value:"৳ "+(l==null?void 0:l.sellPrice)||"--",w:""},{heading:"Status",value:o.jsx("div",{children:o.jsxs("select",{className:e("border rounded-md p-1 focus:outline-none",{"border-green-500 bg-green-500":(l==null?void 0:l.status)==="served"}),children:[o.jsx("option",{children:"Pending"}),o.jsx("option",{children:"Approved"}),o.jsx("option",{children:"Rejected"}),o.jsx("option",{children:"Served"})]})}),w:""},{heading:"",value:o.jsx("div",{className:"flex gap-2 ",children:o.jsx(D,{buttonTitle:o.jsx(I,{size:18}),titleClass:e("min-w-fit px-2 py-[5px] 2xl:py-[9px]"),id:String(l==null?void 0:l.id),isItemTop:"right-8 -bottom-2",itemClass:"py-[7px] 2xl:py-[7px]",data:[{label:"Edit",button:()=>{},icon:o.jsx(T,{className:""})},{label:"Delete",button:()=>{},icon:o.jsx(A,{}),className:"text-redColor border-b-0"}]})}),w:"50px",isAction:!0}];export{$ as default};
