import{m as h,S as k,r as x,n as w,o as g,c as f,F as P,p as b,t as S,q as A,a as v,b as N,u as $,s as B}from"./CzR78lps.js";import{_ as C}from"./DlAUqK2U.js";const E={__name:"machine-gun",props:{text:{type:String,default:""},maxLength:{type:Number,default:12},speed:{type:Number,default:4},loop:{type:Boolean,default:!1},repeat:{type:Number,default:0},onComplete:{type:Function,default:()=>{}}},setup(y){h.registerPlugin(k);const e=y,d=x(null),o=x([]);(e.speed<1||e.speed>10)&&(e.speed=5),e.loop&&(e.repeat=-1);const m=.05+(10-e.speed)*(.4-.05)/9,i=/(\.|\?|!)$/g,_=(t,p)=>{if(typeof p>"u")return t.split(" ");const s=t.split(" "),a=s.length;let l=[];const c=[];for(let r=0;r<a;r++)l.push(s[r]),(i.test(s[r])||r===a-1||l.join(" ").length+s[r+1].length>p)&&(c.push(l.join(" ")),l=[]);return c},u=async()=>{const t=_(e.text,e.maxlength);console.log(t);for(let n=0;n<t.length;n++)o.value.push({text:t[n],id:n}),console.log(t[n]);await A();const p=h.timeline({delay:.6,repeat:e.repeat,repeatDelay:4,onComplete:e.onComplete});let s=0,a,l,c,r;for(let n=0;n<o.value.length;n++)a=o.value[n],console.log(a),r=i.test(a.text)||n===o.value.length-1,l=d.value.children[n],c=Math.max(.5,a.text.length*m),r&&(c+=.6),h.set(l,{autoAlpha:0,scale:0,z:.01}),p.to(l,{duration:c,scale:1.2,ease:"slow(0.25, 0.9)"},s).to(l,{duration:c,autoAlpha:1,ease:"slow(0.25, 0.9, true)"},s),s+=c-.05};return w(()=>{u()}),(t,p)=>(g(),f("div",{ref_key:"demo",ref:d,class:"textContainer"},[(g(!0),f(P,null,b(o.value,(s,a)=>(g(),f("h3",{key:a,class:"textChunk"},S(s.text),1))),128))],512))}},M=C(E,[["__scopeId","data-v-b492a607"]]),T={class:"home"},D=6,F=2.5,I={__name:"index",setup(y){const e=$(),d=u=>[{type:"image",src:`page${u}.png`},{type:"audio",src:`page${u}.mp3`},{type:"video",src:`page${u}.mp4`}];let o=1;const m=()=>{o<=D&&e.queueBatch(d(o),()=>{console.log(`Page ${o} loaded`),o++,m()})};m();const i=x(null),_=()=>{h.to(i.value,{height:0,opacity:0,duration:F,onComplete:()=>B("/storyNew")})};return(u,t)=>{const p=M;return g(),f("div",T,[t[0]||(t[0]=v("div",{class:"background"},null,-1)),v("div",{ref_key:"textContainer",ref:i,class:"text-container"},[N(p,{text:"A world of wonder awaits. Get ready for the epic adventures of Mya and Khita!",speed:6,loop:!1,repeat:0,"max-length":50,"on-complete":_})],512)])}}},q=C(I,[["__scopeId","data-v-3738ccbe"]]);export{q as default};