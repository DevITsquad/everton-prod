class QuickAdd{clearForms(){const t=theme.off_canvas.right_sidebar.querySelectorAll(".product--form");t.length&&t.forEach(t=>t.remove())}initForm(t){const e=theme.off_canvas["right_sidebar"],a=e.querySelectorAll(".product--form");a.length&&a.forEach(t=>t.style.display="none");var o=t.dataset["handle"];const r=e.querySelector(`[data-handle='${o}']`);theme.utils.updateRecentProducts(o),r?r.style.display="block":(o=t.closest(".product--root").querySelector(".product--form"),document.querySelector('[data-view="product-form"]').appendChild(o))}async addToCart(t){t.setAttribute("data-loading",!0);const e=t.closest(".product--root");var a=e.querySelector(".product-buy-buttons--form");theme.utils.getAvailableQuantity(a)?(a=await theme.cart.addItem(a),t.setAttribute("data-loading",!1),a&&(await theme.cart.updateAllHtml(),"closed"===theme.off_canvas.state&&theme.off_canvas.openRight())):t.setAttribute("data-loading",!1),window.trigger("resize")}}theme.quick_add=new QuickAdd;