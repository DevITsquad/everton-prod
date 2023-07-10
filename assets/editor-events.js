class EditorEvents{constructor(){this.sectionListeners()}sectionListeners(){document.addEventListener("shopify:section:load",({target:e})=>{this.loadAssets(e,{styles:!1,scripts:!0});const t=e.querySelector("[data-section-id]");console.log("Event 'theme:section:load' triggered by ."+t.classList[0]),t.trigger("theme:section:load")}),document.addEventListener("shopify:section:unload",({target:e})=>{const t=e.querySelector("[data-section-id]");console.log("Event 'theme:section:unload' triggered by ."+t.classList[0]),t.trigger("theme:section:unload")}),document.addEventListener("shopify:section:select",({target:e})=>{this.loadAssets(e,{styles:!0,scripts:!1});const t=e.querySelector("[data-section-id]");console.log("Event 'theme:section:select' triggered by ."+t.classList[0]),t.trigger("theme:section:select")}),document.addEventListener("shopify:section:deselect",({target:e})=>{const t=e.querySelector("[data-section-id]");console.log("Event 'theme:section:deselect' triggered by ."+t.classList[0]),t.trigger("theme:section:deselect")}),document.addEventListener("shopify:block:select",({target:e})=>{console.log("Event 'theme:block:select' triggered by ."+e.classList[0]),e.trigger("theme:block:select")}),document.addEventListener("shopify:block:deselect",({target:e})=>{console.log("Event 'theme:block:deselect' triggered by ."+e.classList[0]),e.trigger("theme:block:deselect")})}loadAssets(e,o={styles:!0,scripts:!0}){const t=e.querySelectorAll("script.section-assets");t&&t.forEach(e=>{var{name:e,css:t,js:s}=JSON.parse(e.innerHTML);o.styles&&e&&t&&theme.utils.stylesheetLoader(e,t),o.scripts&&e&&s&&theme.utils.libraryLoader(e,s)})}}new EditorEvents;