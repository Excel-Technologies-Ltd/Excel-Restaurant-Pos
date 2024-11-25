import{f as R,F as j,H as v,e as y,Z as C,j as a}from"./index-p5wHqKn5.js";const O=()=>{var h;const{currentUser:o}=R(),{data:x}=j(`excel_restaurant_pos.api.item.get_roles?user=${o}`),m=(h=x==null?void 0:x.message)==null?void 0:h.map(s=>s==null?void 0:s.Role);console.log({userRoles:m}),console.log(o);const c=[{id:1,state:"Order Placed",action:"Accept",nextState:"Work in progress",allowed:"Restaurant Waiter"},{id:2,state:"Order Placed",action:"Reject",nextState:"Canceled",allowed:"Restaurant Waiter"},{id:3,state:"Work in progress",action:"Ready",nextState:"Ready for Pickup",allowed:"Restaurant Chef"},{id:3,state:"Work in progress",action:"Reject",nextState:"Canceled",allowed:"Restaurant Chef"},{id:4,state:"Ready for Pickup",action:"Completed",nextState:"Completed",allowed:"Restaurant Manager"}],{data:u,mutate:d}=j("excel_restaurant_pos.api.item.get_order_list",["*"]),n=u==null?void 0:u.message;console.log(n);const N=(s,l)=>c.filter(t=>(t==null?void 0:t.state)===s&&(l==null?void 0:l.includes(t==null?void 0:t.allowed))),{updateDoc:b}=v(),w=(s,l,t,p)=>{const g=c==null?void 0:c.find(e=>(e==null?void 0:e.state)===l&&(t==null?void 0:t.includes(e==null?void 0:e.allowed))&&(e==null?void 0:e.action)===p);if(g){const e=g.nextState,f={status:e};e==="Completed"&&(f.docstatus=1),b("Table Order",s,f).then(i=>{i&&(console.log("Order status updated successfully:",i),d())}).catch(i=>{console.log("Error updating order status:",i)})}else console.log("Invalid transition for the current state and role.")};return y("Table Order",()=>{d(),console.log("Order List Updated")}),C("Table Order","on_update",s=>{d(),console.log("Event data:",s)}),a.jsxs("div",{className:"p-4",children:[a.jsx("h2",{className:"font-semibold text-xl mb-4",children:"Orders"}),a.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",children:n==null?void 0:n.map(s=>{var l;return a.jsxs("div",{className:"bg-white shadow-lg rounded-md p-4",children:[a.jsxs("div",{className:"flex justify-between items-center",children:[a.jsx("h3",{className:"text-xl font-semibold",children:s==null?void 0:s.name}),a.jsx("div",{className:"text-sm text-gray-500",children:s!=null&&s.table?s==null?void 0:s.table:"Parcel"})]}),a.jsxs("div",{className:"mt-2 text-sm",children:[a.jsxs("p",{className:"font-semibold",children:["Total: ৳",s==null?void 0:s.total_amount]}),a.jsxs("p",{className:"font-semibold",children:["Status: ",s==null?void 0:s.status]})]}),(s==null?void 0:s.remarks)&&a.jsxs("div",{className:"mt-2 text-sm ",children:[a.jsx("strong",{children:"Note:"})," ",s==null?void 0:s.remarks]}),a.jsxs("div",{className:"mt-4",children:[a.jsx("h4",{className:"font-semibold mb-2",children:"Items:"}),a.jsx("ul",{className:"list-none space-y-2",children:(l=s==null?void 0:s.item_list)==null?void 0:l.map((t,p)=>a.jsxs("li",{className:"flex justify-between text-xs",children:[a.jsx("span",{children:t==null?void 0:t.item}),a.jsxs("span",{children:["৳",t==null?void 0:t.rate," x ",t==null?void 0:t.qty]})]},p))})]}),a.jsx("div",{className:"mt-4 w-fit flex h-fit gap-4",children:N(s==null?void 0:s.status,m).map(t=>a.jsx("button",{onClick:()=>w(s==null?void 0:s.name,s==null?void 0:s.status,m,t==null?void 0:t.action),className:"w-full bg-primaryColor text-white py-1.5 px-4 rounded",children:t.action},t.action))})]},s.name)})})]})};export{O as default};
