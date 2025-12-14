<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>上架捐贈物品</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <h1>上架捐贈物品</h1>

    <form id="donationForm">
      <div class="form-group">
        <label>物品名稱 *</label>
        <input id="item_name" required />
      </div>

      <div class="form-group">
        <label>數量 *</label>
        <input id="quantity" type="number" min="1" value="1" required />
      </div>

      <div class="form-group">
        <label>地區</label>
        <input id="area" />
      </div>

      <div class="form-group">
        <label>取貨地點</label>
        <input id="pickup_location" />
      </div>

      <div class="form-group">
        <label>圖片網址</label>
        <input id="image_url" type="url" />
      </div>

      <div class="form-group">
        <label>描述</label>
        <textarea id="description"></textarea>
      </div>

      <button type="submit">送出上架</button>
      <div id="msg" class="message"></div>
    </form>
  </div>

  <script src="add-donation.js"></script>
</body>
</html>
