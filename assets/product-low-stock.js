class ProductLowStock extends HTMLElement{constructor(){super()}connectedCallback(){this.initial_availability="true"===this.dataset.initialAvailability,this.initial_quantity=parseInt(this.dataset.initialQuantity),this.root=this.closest(`[data-product-id='${this.dataset.id}']`),this.threshold=parseInt(this.dataset.threshold),this.variants_json=JSON.parse(this.querySelector("#product-low-stock--json").innerHTML),this.updateListener(),this.initial_availability?this.update(this.initial_quantity):this.show(!1)}updateListener(){this.root.on("variantUpdated",t=>{const i=t.detail;i&&(t=this.variants_json.find(t=>t.id===i.id))&&t.available?this.update(t.quantity):this.show(!1)})}update(t){let i;!t||t<1||t>this.threshold?this.show(!1):(1===t?i=(i=theme.translations.low_in_stock.one).replace("&#39;","'"):1<t&&(i=(i=theme.translations.low_in_stock.other).replace(/\d+/,t).replace("&#39;","'")),this.innerText=i,this.show(!0))}show(t){this.style.display=t?"block":"none",this.parentNode.setAttribute("data-empty",!t)}}const productLowStockEl=customElements.get("product-low-stock-root");productLowStockEl||customElements.define("product-low-stock-root",ProductLowStock);