const apiPath = "chung";
const token = "yDQO97lthtVqa7aF8apee2R1FMY2";
const baseUrl = "https://livejs-api.hexschool.io/"

// 計算營收 
const calcProductRevenue = () => {
  //篩選訂單內產品名稱與營收
  let orderProductAry = [];
  orderData.forEach((order) => {
    order.products.forEach((product) => {
      let obj = {};
      obj.title = product.title;
      obj.revenue = product.price * product.quantity;
      orderProductAry.push(obj)
    })
  });
  //整理相同品項營收
  let productRevenueObj = {};
  orderProductAry.forEach((item)=>{
    if (productRevenueObj[item.title] == undefined){
      productRevenueObj[item.title] = item.revenue;
    }else{
      productRevenueObj[item.title] += item.revenue;
    };    
  });
  //判斷前三名品項與其他
  let productRevenueAry = Object.entries(productRevenueObj).sort((a,b)=>{ return b[1]-a[1]});
  let otherRevenue = 0;
  let aryForC3 = [];
  productRevenueAry.forEach( (product, index) => {
    if(index <= 2){
      aryForC3.push(product)
    }else if(index > 2){
      otherRevenue += product[1]
    }
  });
  if(productRevenueAry.length > 3){
    aryForC3.push(["其他", otherRevenue])
  };
  renderChart(aryForC3);
};

// 渲染C3
const renderChart = (data) => {
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
    },
    data: {
        type: "pie",
        columns: data
    },
  });
}

// 渲染畫面
let orderData = [];
const orderListWrap = document.querySelector('.orderListWrap');
const renderOrderList = (data) => {
  orderListWrap.innerHTML = data.map( item => 
  `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${item.products.map( product => `<p>${product.title} x ${product.quantity}</p>`).join('')}
        </td>
        <td>${formatTime(item.createdAt)}</td>
        <td class="orderStatus">
          <a href="#" class="orderStatus" data-orderid="${item.id}" data-orderpaid="${item.paid}" >${item.paid ? "已處理" : "未處理"}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-orderid="${item.id}" value="刪除">
        </td>
    </tr>`
  ).join('');
};
//時間格式化處理(參考助教寫法)
function formatTime(timeStamp) {
  const time = new Date(timeStamp * 1000);
  //方法一
  // return `${time.getFullYear()}/${time.getMonth()}/${time.getDate()} ${String(time.getHours()).padStart(2,0)}:${time.getMinutes()}:${time.getSeconds()}`;
  //方法二
  return time.toLocaleString('zh-TW', {
    hour12: false
  })
};
// 取得訂單列表
const getOrderList = () => {
  const url = `${baseUrl}api/livejs/v1/admin/${apiPath}/orders`;
  axios.get( url ,
    {
      headers: {
        'Authorization': token
      }
    })
    .then( (response) => {
      orderData = response.data.orders;
      renderOrderList(orderData);
      calcProductRevenue();
    })
    .catch( error => console.log(error))
};

// 表單操控
const orderPageList = document.querySelector('.orderPage-list');

orderPageList.addEventListener("click", event => {
  event.preventDefault();
  //修改付款
  if(event.target.classList.contains("orderStatus")){
    let orderId = event.target.dataset.orderid;
    let orderStatus = event.target.dataset.orderpaid;
    editOrderList(orderId, orderStatus);
  };
  //刪除全部
  if(event.target.classList.contains("discardAllBtn")){
    deleteAllOrder();
  };
  //刪除單筆
  if(event.target.classList.contains("delSingleOrder-Btn")){
    let orderId = event.target.dataset.orderid;
    deleteOrderItem(orderId);
  };
})

// 修改訂單狀態
const editOrderList = (orderId, orderStatus) => {
  const url = `${baseUrl}api/livejs/v1/admin/${apiPath}/orders`; 
  if(orderStatus == 'false'){
    orderStatus = true
  }else{
    orderStatus = false
  }; 
  const data = {
    data: {
      id: orderId,
      paid: orderStatus 
    }
  };
  const config = {
    headers: {
      'Authorization': token
    }
  };
  axios.put( url, data, config)
    .then(() => getOrderList())
    .catch( error => console.log(error))
};

// 刪除全部訂單
const deleteAllOrder = () => {
  const url = `${baseUrl}api/livejs/v1/admin/${apiPath}/orders`;
  const config = {
    headers: {
      'Authorization': token
    }
  };
  axios.delete(url, config)
    .then(() => getOrderList())
    .catch(error => console.log(error))
};

// 刪除特定訂單
function deleteOrderItem(orderId) {
  const url = `${baseUrl}api/livejs/v1/admin/${apiPath}/orders/${orderId}`;
  const config = {
    headers: {
      'Authorization': token
    }
  };
  axios.delete(url, config)
    .then(() => getOrderList())
    .catch(error => console.log(error))
};

//初始化
const init = () => {
  getOrderList();
};

init();