const apiPath = "chung";
const token = "yDQO97lthtVqa7aF8apee2R1FMY2";
const baseUrl = "https://livejs-api.hexschool.io/"

// 渲染產品列表畫面
const productList = document.querySelector('.productWrap');
let productsData = [];

const renderProductList = () => {
    productList.innerHTML = productsData.map(item => `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="${item.description}">
                <a href="#" class="addCardBtn" data-productid=${item.id}>加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
                </li>`).join('');
};

// 取得產品列表
const getProductList = () => {
    const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/products`;
    axios.get(url)
    .then((response) => {
        productsData = response.data.products;
        renderProductList();
    })
    .catch(error => console.log(error.data.message || "取得產品資料失敗"));
};

getProductList();

// 渲染購物車列表畫面
const cartListWrap = document.querySelector('.cartListWrap');
const cartTotalPrice = document.querySelector('.cartTotalPrice')
let cartData = [];
let totalPrice = 0;

const renderCartList = () => {
    cartListWrap.innerHTML = cartData.map((item, index) => 
        `<tr>
            <td>
                <div class="cardItem-title">
                    <img src=${item.product.images} alt=${item.product.description}>
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" data-cartid="${item.id}" class="material-icons js-discardBtn">
                    clear
                </a>
            </td>
        </tr>`
    ).join('');
    cartTotalPrice.textContent = `NT$${totalPrice}`;
};
// 取得購物車列表
const getCartList = () => {
    const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/carts`;
    axios.get(url)
    .then((response) => {
        cartData = response.data.carts;
        totalPrice = response.data.finalTotal;
        renderCartList();
    })
    .catch(error => console.log(error || "取得購物車資料失敗"))
};

getCartList();

// 加入購物車
productList.addEventListener("click", (event) => {
  event.preventDefault();
  let productId = event.target.dataset.productid;
  let num = 1;
  cartData.forEach( item =>{
    if(item.product.id === productId){ 
      num = item.quantity + 1
    };
  });
  let productData = {
    data: {
      productId: productId,
      quantity: num
    }
  };
  if (event.target.classList.contains("addCardBtn")){
    addCartItem(productData);
  };

});

const addCartItem = (data) => {
    const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/carts`;
    axios.post( url, data)
    .then(() => getCartList())
    .catch( error => console.log(error) )
};

// 清除購物車內全部產品
const deleteAllCartList = () => {
  const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/carts`;
  axios.delete(url)
  .then(() => getCartList())
  .catch( error => console.log(error.response.data.message))
};

const deleteAllBtn = document.querySelector('.discardAllBtn');

deleteAllBtn.addEventListener("click", (event) => {
  event.preventDefault();
  deleteAllCartList();
});

// 刪除購物車內特定產品
const shoppingCartTable = document.querySelector('.shoppingCart-table');

shoppingCartTable.addEventListener("click", (event) => {
  event.preventDefault();
  const cartId = event.target.dataset.cartid;
  if (event.target.classList.contains("js-discardBtn")){
    deleteCartItem(cartId);
  }
});

const deleteCartItem = (cartId) => {
  const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/carts/${cartId}`;
  axios.delete(url)
  .then(() => getCartList())
  .catch( error => console.log(error))
};

// 送出購買訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');

orderInfoBtn.addEventListener("click", event => {
  event.preventDefault();
  createOrder();
})

function createOrder() {
  const url = `${baseUrl}api/livejs/v1/customer/${apiPath}/orders`;
  
  const name = document.querySelector("#customerName");
  const phone = document.querySelector("#customerPhone");
  const email = document.querySelector("#customerEmail");
  const address = document.querySelector("#customerAddress");
  const payment = document.querySelector("#tradeWay");
  
  let customerInputData = {
    data : {
      user: {
        name: name.value,
        tel: phone.value,
        email: email.value,
        address: address.value,
        payment: payment.value
      }
    }
  };

  axios.post( url, customerInputData )
  .then(() => getCartList())
  .catch(error => console.log(error.response.data.message));

  [name, phone, email, address, payment].forEach( item => item.value = "" );
};

