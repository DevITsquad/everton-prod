export default class FeaturedProduct extends HTMLElement{constructor(){super()}connectedCallback(){this.magnify=parseFloat(this.getAttribute("data-magnify")),this.main_media=this.querySelectorAll(".product-media--featured"),this.media_container=this.querySelector(".product-media--wrapper"),this.thumbs=this.querySelectorAll('[data-view="thumb-container"] .product-media--thumb'),this.zoom_enabled="true"===this.getAttribute("data-zoom-enabled"),this.zoom_images=this.querySelectorAll(".product-media--zoom-image"),this.updateMediaListener(),this.zoom_enabled&&this.zoom_images.length&&this.resizeListener(),this.thumbs.length&&this.thumbNavigation(),Shopify.designMode&&this.sectionListener()}disconnectedCallback(){this.off("variantUpdated.FeaturedProduct"),window.off("resize.FeaturedProduct"),this.thumbs.off("keypress.FeaturedProduct click.FeaturedProduct")}updateMediaListener(){this.on("variantUpdated.FeaturedProduct",({detail:e})=>{e=e&&e.featured_media?parseInt(e.featured_media.id):0;this.updateVariantMedia(e)})}updateVariantMedia(a){0!==a&&(this.main_media.forEach(e=>{var t=parseInt(e.getAttribute("data-id")),i=!e.closest(".carousel--root");e.setAttribute("data-active",t===a),i&&(e.parentNode.style.display=t===a?"block":"none")}),this.thumbs.forEach(e=>{var t=parseInt(e.getAttribute("data-id"));e.setAttribute("data-active",t===a)}),this.zoom_enabled&&this.imageZoom())}imageZoom(){var e,t,i,a;this.media_container.off("mouseenter.FeaturedProduct.ImageZoom mouseleave.FeaturedProduct.ImageZoom mousemove"),this.main_media.length<1||"small"===theme.mqs.current_window||(e=this.media_container.querySelector('.product-media--featured[data-active="true"]'),this.media_container.setAttribute("data-media-type",e.dataset.mediaType),this.active_zoom_image=e.nextElementSibling,this.active_zoom_image&&(this.active_zoom_image.style.display="none",{offsetHeight:e,offsetWidth:t}=this.media_container,i=t*this.magnify,a=e*this.magnify,this.active_zoom_image.style.width=i+"px",this.active_zoom_image.querySelector(".image--root").style.width=i+"px",this.active_zoom_image.querySelector("img").classList.add("lazypreload"),this.x_ratio=(i-t)/t,this.y_ratio=(a-e)/e,this.media_container.on("mouseenter.FeaturedProduct.ImageZoom",()=>this.active_zoom_image.style.display="block"),this.media_container.on("mouseleave.FeaturedProduct.ImageZoom",()=>this.active_zoom_image.style.display="none"),this.media_container.on("mousemove",({pageX:e,pageY:t})=>{this.animation_request&&cancelAnimationFrame(this.animation_request),this.animation_request=requestAnimationFrame(()=>this.moveZoomImage(e,t))})))}moveZoomImage(e,t){var{left:i,top:a}=this.media_container.offset();this.active_zoom_image.setStyles({left:(i-e)*this.x_ratio+"px",top:(a-t)*this.y_ratio+"px"})}resizeListener(){window.on("resize.FeaturedProduct",theme.utils.debounce(100,()=>this.imageZoom()))}thumbNavigation(){this.thumbs.on("keypress.FeaturedProduct click.FeaturedProduct",e=>{if(theme.a11y.click(e)){const t=this.querySelector('.product-media--featured[data-active="true"] > *');t&&t.trigger("pauseMedia");e=parseInt(e.target.getAttribute("data-id"));this.updateVariantMedia(e);const i=this.querySelector(`.product-media--featured[data-id='${e}'] > *`);"small"!==theme.mqs.current_window&&i&&i.trigger("playMedia"),"image"!==i.parentNode.getAttribute("data-media-type")&&i.focus()}})}sectionListener(){this.on("theme:section:load",()=>this.imageZoom())}}const featuredProductEl=customElements.get("featured-product-root");featuredProductEl||customElements.define("featured-product-root",FeaturedProduct);