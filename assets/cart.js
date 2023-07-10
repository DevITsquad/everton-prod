class Cart extends HTMLElement {
  static external_counts = document.querySelectorAll(".cart--external--total-items");
  static external_icons = document.querySelectorAll(".cart--external--icon");
  static external_prices = document.querySelectorAll(".cart--external--total-price");
  static instances = [];
  constructor() {
    super();


  }
  connectedCallback() {
    Cart.instances.push(this),
      (this.abort_controllers = {}),
      (this.checkout_button = this.querySelector(".cart--checkout-button button")),
      (this.dynamic_checkout_buttons = this.querySelector(".cart--additional-buttons")),
      (this.note = this.querySelector(".cart--notes--textarea")),
      this.eventListeners(),
      this.toggleLoadingOnSubmit(),
      this.note && this.noteTypingListener(),
      this.dynamic_checkout_buttons && this.renderDynamicCheckoutButtons()

  }
  eventListeners() {
    this.inputBoxListeners(), this.plusButtonListener(), this.minusButtonListener(), this.removeButtonListener();
  }
  toggleLoadingOnSubmit() {
    this.checkout_button && this.checkout_button.on("click", () => this.checkout_button.setAttribute("data-loading", !0));
  }
  noteTypingListener() {
    this.note.on("input", () => {
      this.updateNote(this.note.value), Cart.instances.not(this).forEach((t) => (t.note.value = this.note.value));
    });
  }
  async updateNote(t) {
    this.abort_controllers.note && this.abort_controllers.note.abort(), (this.abort_controllers.note = new AbortController());
    try {
      await fetch(theme.urls.cart + "/update.js", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: t }), signal: this.abort_controllers.note.signal });
    } catch { }
  }
  renderDynamicCheckoutButtons() {
    if (window.location.pathname === theme.urls.cart) {
      const t = theme.off_canvas.right_sidebar.querySelector(".cart--additional-buttons");
      if ((t && t.remove(), "small" === theme.mqs.current_window)) {
        const e = theme.off_canvas.main_content.querySelector('[data-view="desktop"] .cart--additional-buttons');
        e && e.remove();
      }
    }
  }
  inputBoxListeners() {
    let r;
    const t = this.querySelectorAll(".cart--quantity--input");
    t.length &&
      (t.on("keydown", (t) => {
        var e = t["which"];
        (e < 48 || 57 < e) && (e < 37 || 40 < e) && 8 !== e && 9 !== e && t.preventDefault();
      }),
        t.on("focusin", async ({ target: t }) => (r = parseInt(t.value))),
        t.on("focusout", async ({ target: t }) => {
          var e = parseInt(t.value),
            a = t.closest(".cart--item").getAttribute("data-line-num");
          isNaN(e) || e === r ? (t.value = r) : ((t.value = e), this.toggleLoadingDisplay(!1, a), (t = await this.updateQuantity(a, e)), await Cart.updateAllHtml(), t || this.showQuantityError(a));
        }));
  }
  plusButtonListener() {
    const t = this.querySelectorAll(".cart--plus");
    t.length &&
      t.on("click keydown", (t) => {
        if ("keydown" !== t.type || "Enter" === t.key) {
          t.preventDefault();
          const a = t.target.previousElementSibling;
          var t = t.target.closest(".cart--item").getAttribute("data-line-num"),
            e = 0 < parseInt(a.value) ? parseInt(a.value) + 1 : 1;
          (a.value = e), this.toggleLoadingDisplay(!1, t), this.tryToUpdateQuantity(t, e);
        }
      });
  }
  minusButtonListener() {
    const t = this.querySelectorAll(".cart--minus");

    t.length &&
      t.on("click keydown", (t) => {
        if ("keydown" !== t.type || "Enter" === t.key) {
          t.preventDefault();
          const a = t.target.parentNode.querySelector("input");
          var e;
          1 !== parseInt(a.value) &&
            ((t = t.target.closest(".cart--item").getAttribute("data-line-num")), (e = 1 < parseInt(a.value) - 1 ? parseInt(a.value) - 1 : 1), (a.value = e), this.toggleLoadingDisplay(!1, t), this.tryToUpdateQuantity(t, e));
        }
      });
  }
  removeButtonListener() {
    const t = this.querySelectorAll(".cart--item--remove");
    t.length &&
      t.on("click", (t) => {
        t.preventDefault();
        t = t.target.closest(".cart--item").getAttribute("data-line-num");
        this.toggleLoadingDisplay(!1, t), this.tryToUpdateQuantity(t, 0);
      });
  }
  toggleLoadingDisplay(t, e) {
    if (!t && e) {
      const a = this.querySelector(`.cart--item[data-line-num='${e}'] input`);
      a && a.setAttribute("data-loading", !0);
    }
    this.checkout_button.setAttribute("data-disabled", !t), this.dynamic_checkout_buttons && this.dynamic_checkout_buttons.setAttribute("data-disabled", !t);
  }
  async tryToUpdateQuantity(t, e) {
    try {
      var a = await this.updateQuantity(t, e);
      await Cart.updateAllHtml(), a || 0 === e || this.showQuantityError(t);
    } catch { }
  }
  showQuantityError(t) {
    const e = this.querySelector(`.cart--item[data-line-num='${t}']`);
    e && e.querySelector(".cart--error").removeAttribute("style");
  }
  async updateQuantity(t, e) {
    this.abort_controllers.line_num && this.abort_controllers.line_num.abort(), (this.abort_controllers.line_num = new AbortController());
    const a = this.querySelector(`.cart--item[data-line-num='${t}']`);
    var r = "shopify" === a.getAttribute("data-inventory-management"),
      n = "continue" !== a.getAttribute("data-inventory-policy"),
      o = parseInt(a.getAttribute("data-inventory-quantity")),
      r = o < e && r && n;
    r && (e = o);
    try {
      var i = await fetch(theme.urls.cart_change + ".js", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ line: t, quantity: e }), signal: this.abort_controllers.line_num.signal });
      if (i.ok) return Cart.fetchTotals(), !r;
      throw new Error(i.statusText);
    } catch {
      throw new Error("aborted");
    }
  }
  static updateAllHtml() {
    var t = Cart.instances.map((t) => t.updateHtml());
    return Promise.allSettled(t);
  }
  async updateHtml() {
    const t = await fetch(theme.urls.cart + "?view=ajax-" + this.dataset.view);
    var e;
    if (t.ok) return (e = await t.text()), (e = theme.utils.parseHtml(e, ".cart--form")), this.swapInNewContent(e), this.toggleLoadingDisplay(!0), this.eventListeners(), window.trigger("theme:cart:updated"), !0;
    throw new Error(t.statusText);

  }
  swapInNewContent(t) {
    const e = this.querySelector(".cart--body");
    var a = t.querySelector(".cart--body"),
      a = this.swapInImages(e, a);
    e && a && e.replaceWith(a);


    const r = this.querySelector(".cart--total--price");
    a = t.querySelector(".cart--total--price");



    if (!r.querySelector('#stack-discounts-subtotal-value')) {
      r && a && r.replaceWith(a);
    }


    const itemsInCart = document.querySelectorAll(".cart--item .cart--item--title a")
    const mayAlsoLikeItems = document.querySelectorAll(".col_md_12.cart__table .cart__product-title")
    itemsInCart.forEach(itemInCart => {
      mayAlsoLikeItems.forEach(mayAlsoLikeItem => {
        if (itemInCart.innerHTML == mayAlsoLikeItem.innerHTML || itemInCart.innerHTML == mayAlsoLikeItem.innerHTML.split('/')[1]) {
          mayAlsoLikeItem.closest('.col_md_12').style = "display:none;"
        }
      })
    })

  }
  swapInImages(a, t) {
    const e = t.querySelectorAll(".cart--item");
    return (
      0 !== e.length &&
      (e.forEach((t) => {
        const e = t.querySelector(".cart--item--image");
        t = a.querySelector(`[data-variant-id='${t.getAttribute("data-variant-id")}'] .cart--item--image`);
        t && e && e.replaceWith(t);
      }),
        t)
    );
  }
  static async addItem(t) {
    (t = new FormData(t)), (t = new URLSearchParams(t).toString()), (t = await fetch(theme.urls.cart_add + ".js", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: t }));
    if (t.ok) return Cart.fetchTotals(), !0;
    throw new Error(t.statusText);
  }
  static async fetchTotals(t = !1,isTrigger) {
    const e = await fetch(theme.urls.cart + ".js");
    if (!e.ok) throw new Error(e.statusText);
    var a = await e.json();
    Cart.setItems(a.items,isTrigger), t || Cart.updateTotals(a);
  }
  static setItems(t,isTrigger = true) {
    t = t.reverse()

    const e = {};
    t.forEach((t) => (e[t.id] = t.quantity)), localStorage.setItem(theme.local_storage.cart_items, JSON.stringify(e));

    var hponetitle = $('.hfp_one').attr("fptitle");
    var hptwotitle = $('.hfp_two').attr("fptitle");
    var exc_onetitle = $('.exc_one').attr("exptitle");
    var exc_twotitle = $('.exc_two').attr("exptitle");
    var fponeid = $('.hfp_one').attr("var_id");
    var fptwoid = $('.hfp_two').attr("var_id");
    $.ajax({
      url: '/cart.js',
      type: "GET",
      dataType: 'JSON',
      success: function (res) {
        if (document.querySelector(".cart--checkout-button button")) {
          document.querySelector(".cart--checkout-button button").addEventListener('click', function () {
            if (res['total_price'] <= 0)
            location.reload();
          });
        }



        var itemcount = res['item_count'];
        var total_price = res['total_price'] - (discount || 0);

        g_total_price = res['total_price'];
        g_total_price_after_discount = total_price;


        var items = res['items'];
        var filtredItems = items.filter(a => a.price > 0)
        for (i = 0; i < items.length; i++) {
          var title = items[i]['product_title'];
          if (title == hponetitle) {
            var target_title = title;
          }
          else if (title == hptwotitle) {
            var target_title_two = title;
          }
          else if (title == exc_onetitle) {
            var target_title_three = title;
          }
          else if (title == exc_twotitle) {
            var target_title_four = title;
          }
        }


        if ((target_title_three == exc_onetitle) || (target_title_four == exc_twotitle)) {
          $(`.cart--item[data-variant-id="${fponeid}"] .cart--item--remove`).trigger('click');
          $(`.cart--item[data-variant-id="${fptwoid}"] .cart--item--remove`).trigger('click');
        }
        var cond = items.length;

        //popup closing logic
        $(".popup__custom__more100 span").click(function () {
          $(".active").removeClass('active');
        });
        $(".popup__custom__less100 span").click(function () {
          $(".active").removeClass('active');
        });


        $(".popup__custom__more100 button").click(function () {
          $(".active").removeClass('active');
          sessionStorage.setItem("isShowAgain", "false");
        });
        $(".popup__custom__less100 button").click(function () {
          $(".active").removeClass('active');
          sessionStorage.setItem("isShowAgain", "false");
        });


        if (itemcount > 0) {
          $('#shipping_bar').show();

        } else {
          $('#shipping_bar').hide();

        }
        if (total_price < 5000) {

          $('.active').removeClass('active');

          $(".badgeone").addClass("active_step_one");
          $(".badgetwo").removeClass("active_step_two");
          $(".badgethree").removeClass("active_step_three");
          $(".msgone").show();
          $(".msgtwo").hide();
          $(".msgthree").hide();
          $(".progress_wrap .bar").css("width", "33.333%");
          if ((target_title == hponetitle) || (target_title_two == hptwotitle)) {
            //$(`.cart--item[data-variant-id="${fponeid}"] .cart--item--remove`).trigger('click');
            //$(`.cart--item[data-variant-id="${fptwoid}"] .cart--item--remove`).trigger('click');
            var myarray = [fponeid, fptwoid];
            var qty = 0;
            var i = 0;
            var data = { updates: {} };
            for (i = 0; i < myarray.length; i++) {
              data.updates[myarray[i]] = qty;
            }
            jQuery.ajax({
              type: 'POST',
              url: '/cart/update.js',
              data: data,
              dataType: 'json',
              success: function () {
                Cart.fetchTotals();
                Cart.updateAllHtml();
              }
            });
          }
        }
        else if (total_price > 5000 && total_price < 10000) {
          $(".badgeone").addClass("active_step_one");
          $(".badgetwo").addClass("active_step_two");
          $(".badgethree").removeClass("active_step_three");
          $(".msgone").hide();
          $(".msgtwo").show();
          $(".msgthree").hide();


          if (isTrigger && sessionStorage.getItem("isShowAgain") != "false" && $(".off-canvas--right-sidebar[data-transition]").attr('data-transition') != 'at_start') {
            console.log('first', $(".off-canvas--right-sidebar[data-transition]").attr('data-transition'))
            $('.popup__custom__more100').removeClass('active');
            $('.popup__custom__less100').addClass('active')
            $('.popup__custom__wrapper').addClass('active')

          }

          $(".progress_wrap .bar").css("width", "66.666%");
          if (target_title == hponetitle) {

          }
          else {


            var var_id = $('.hfp_one').attr("var_id");
            var qty = 1;
            var fpcmp = $('.hfp_one').attr("fpcmp");
            // var form_data = {
            //   id: var_id,
            //   quantity: qty,
            //   properties: {
            //     'Compare_Price': fpcmp
            //   }
            // };


            $.ajax({
              url: "/cart/clear.js",
              type: "POST",
              dataType: "JSON",
              success: function (result) {
                $.ajax({
                  url: "/cart/add",
                  type: "POST",
                  data: {
                    items: [
                      {
                        id: var_id,
                        quantity: qty,
                        properties: {
                          'Compare_Price': fpcmp
                        }
                      },
                      ...filtredItems
                    ]
                  },
                  dataType: "JSON",
                  success: function (result) {
                    Cart.updateAllHtml();
                  }
                });

              }
            });



          }
          if (target_title_two == hptwotitle) {
            var var_id = $('.hfp_two').attr("var_id");
            var data = {
              quantity: 0,
              id: var_id
            };
            $.ajax({
              url: '/cart/change.js',
              type: 'POST',
              data: data,
              dataType: 'JSON',
              success: function (res) {
                Cart.updateAllHtml();
              }
            });
          }
        }
        else if (total_price > 10000) {
          console.log('second', $(".off-canvas--right-sidebar[data-transition]").attr('data-transition'))
          if (isTrigger && sessionStorage.getItem("isShowAgain") != "false" && $(".off-canvas--right-sidebar[data-transition]").attr('data-transition') != 'at_start') {
            $('.popup__custom__less100').removeClass('active');
            $('.popup__custom__more100').addClass('active');
            $('.popup__custom__wrapper').addClass('active')
          }

          $(".badgeone").addClass("active_step_one");
          $(".badgetwo").addClass("active_step_two");
          $(".badgethree").addClass("active_step_three");
          $(".msgone").hide();
          $(".msgtwo").hide();
          $(".msgthree").show();
          $(".progress_wrap .bar").css("width", "100%");
          if ((target_title_three == exc_onetitle) || (target_title_four == exc_twotitle)) {

          }
          else {
            if ((target_title == hponetitle) && (target_title_two == undefined)) {



              var var_id = $('.hfp_two').attr("var_id");
              var qty = 1;
              var fpcmptwo = $('.hfp_two').attr("fpcmp");
              var form_data = {
                items: [{
                  id: var_id,
                  quantity: qty,
                  properties: {
                    'Compare_Price': fpcmptwo
                  }
                },
                ...(items.reverse())
                ]

              };


              $.ajax({
                url: "/cart/clear.js",
                type: "POST",
                dataType: "JSON",
                success: function (result) {
                  $.ajax({
                    url: "/cart/add",
                    type: "POST",
                    data: form_data,
                    dataType: "JSON",
                    success: function (result) {
                      Cart.updateAllHtml();
                    }
                  });
                }
              });

            }
            else if ((target_title == hponetitle) && (target_title_two == hptwotitle)) {

            }
            else {




              var cmpone = $('.hfp_one').attr("fpcmp");
              var cmptwo = $('.hfp_two').attr("fpcmp");
              var var_id_one = $('.hfp_one').attr("var_id");
              var var_id_two = $('.hfp_two').attr("var_id");

              var datanew = {
                items: [{
                  quantity: 1,
                  id: var_id_one,
                  properties: {
                    'Compare_Price': cmpone
                  }
                }, {
                  quantity: 1,
                  id: var_id_two,
                  properties: {
                    'Compare_Price': cmptwo
                  }
                }, ...filtredItems]

              };
              $.ajax({
                url: "/cart/clear.js",
                type: "POST",
                dataType: "JSON",
                success: function (result) {
                  $.ajax({
                    url: "/cart/add",
                    type: "POST",
                    data: datanew,
                    dataType: "JSON",
                    success: function (result) {
                      Cart.updateAllHtml();
                    }
                  });

                }
              });
              // $.ajax({
              //   url: "/cart/add",
              //   type: "POST",
              //   data: datanew,
              //   dataType: "JSON",
              //   success: function (result) {
              //     Cart.updateAllHtml();
              //   }
              // });
            }
          }
        }
      }

    });
  }
  static updateTotals({ item_count: a, total_price: e }) {
    const { external_counts: t, external_icons: r, external_prices: n, instances: o } = Cart;
    t.forEach((t) => (t.textContent = a)),
      r.forEach((t) => t.setAttribute("data-item-count", a)),
      n.forEach((t) => (t.textContent = theme.utils.formatMoney(e))),
      o.forEach((t, e) => {
        t.setAttribute("data-has-items", 0 < a), 0 === a && ((t.note.value = ""), 0 === e && t.updateNote(""));
      });
  }
}


$(document).on('click', '.add_to_cart', function (event) {
  event.preventDefault();
  var ID = $(this).next('.ad_to_cart_id').attr("var_id");
  var cmp = $(this).next('.ad_to_cart_id').attr("cmp_price");
  var textbtn = $(this).children('.addtxt');
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    data: {
      quantity: 1,
      id: ID,
      properties: {
        'Compare_Price': cmp
      }
    },
    dataType: 'json',
    beforeSend: function () {
      $(textbtn).text("Adding...");
    },
    success: function (data) {
      Cart.fetchTotals();
      Cart.updateAllHtml();
      $(textbtn).text("Added");
    },
    complete: function () {
      setTimeout(function () {
        $(textbtn).text("Add");
      }, 1000);
    }
  });
});
(theme.cart = Cart), theme.cart.fetchTotals(!0), customElements.define("cart-root", Cart);

var g_total_price;
var g_total_price_after_discount;
let discount = 0;
let previousDiscountValue = null;

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "data-discount-value") {
      const element = mutation.target;
      const newDiscountValue = parseFloat(element.getAttribute("data-discount-value"));
      if (!isNaN(newDiscountValue) && newDiscountValue !== previousDiscountValue) {
        discount = newDiscountValue * 100;
        previousDiscountValue = newDiscountValue;
        Cart.fetchTotals(!1,false);
      }
    }
  });
});

const initialDiscountElement = document.querySelector("[data-discount-value]");
if (initialDiscountElement) {
  const initialDiscountValue = parseFloat(initialDiscountElement.getAttribute("data-discount-value"));
  if (!isNaN(initialDiscountValue)) {
    discount = initialDiscountValue * 100;
    previousDiscountValue = initialDiscountValue;
  }
}

observer.observe(document.body, {
  attributeFilter: ["data-discount-value"],
  attributeOldValue: true,
  subtree: true,
});