class General{constructor(){this.loadSwipeLibrary(),this.configureLinks(),this.checkFlexBoxGap(),"loading"===document.readyState?window.on("DOMContentLoaded",()=>this.load()):this.load()}load(){document.body.setAttribute("data-assets-loaded",!0),document.documentElement.className=document.documentElement.className.replace("no-js","js")}loadSwipeLibrary(){theme.utils.libraryLoader("swipe",theme.assets.swipe,()=>{theme.utils.disable_prevent_scroll=!1,theme.utils.disable_swipe_listener=!1;const e=document.querySelectorAll("input, textarea");e.on("focus",()=>theme.utils.disable_prevent_scroll=!0),e.on("blur",()=>theme.utils.disable_prevent_scroll=!1),SwipeListener(document,{preventScroll:e=>{var t;if(!theme.utils.disable_prevent_scroll)return t=Math.abs(e.detail.x[0]-e.detail.x[1]),2*Math.abs(e.detail.y[0]-e.detail.y[1])<t}}),document.addEventListener("swipe",e=>{var t,l,n;theme.utils.disable_swipe_listener||({left:e,right:t,top:l,bottom:n}=e.detail.directions,e&&document.documentElement.trigger("theme:swipe:left"),t&&document.documentElement.trigger("theme:swipe:right"),l&&document.documentElement.trigger("theme:swipe:up"),n&&document.documentElement.trigger("theme:swipe:down"))})})}configureLinks(){document.querySelectorAll('[data-item="hidden-text"] a').forEach(e=>e.setAttribute("tabindex","-1"))}checkFlexBoxGap(){const e=document.createElement("div");e.setStyles({display:"flex",flexDirection:"column",rowGap:"1px"}),e.appendChild(document.createElement("div")),e.appendChild(document.createElement("div")),document.body.appendChild(e);var t=0<e.scrollHeight;e.remove(),t||(document.documentElement.classList.remove("flexbox-gap"),document.documentElement.classList.add("no-flexbox-gap"))}}new General;