var rfc339date = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})$/;

parseRFC3339Date = function (d) {
    var m = rfc339date.exec(d);
    var year   = +m[1];
    var month  = +m[2];
    var day    = +m[3];
    var hour   = +m[4];
    var minute = +m[5];
    var second = +m[6];
    var tzHour = +m[7];
    var tzMin  = +m[8];
    var tzOffset = new Date().getTimezoneOffset() + tzHour * 60 + tzMin;

    return new Date(year, month - 1, day, hour, minute - tzOffset, second, 0);
}

var showError = function (msg) {
  $('#notify').text(msg);
}

var getBidData = function () {
  m = /http:\/\/page\d.auctions.yahoo.co.jp\/jp\/auction\/(\w+)/.exec($('#auctionURL').val());
  if(m === null) {
    showError('URLの形式が間違っています');
    return false;
  }
  auctionID = m[1];

  $.ajax({
    type: 'GET',
    url: 'http://auctions.yahooapis.jp/AuctionWebService/V1/BidHistory',
    dataType: 'jsonp',
    jsonp: 'callback',
    data: {
      appid: 'dj0zaiZpPWhqdHJzb0xTRmpoQSZzPWNvbnN1bWVyc2VjcmV0Jng9NTg-',
      output: 'json',
      auctionID: auctionID
    }
  }).done(function (bids) {
    bids = bids.ResultSet.Result;

    var data = [['時期'], ['金額']];
    for(var i = bids.length - 1;i >= 0; i--) {
      var res = bids[i];
      var date = parseRFC3339Date(res.Date.trim());
      data[0].push(date.getDate() + '日' + date.getHours() + '時' + date.getMinutes() + '分');
      data[1].push(res.Price);
    }

    var chartdata = {
      config: {
        type: 'line',
        lineWidth: 4,
        width: 1500,
        colorSet: ['red'],
        bgGradient: {
          direction: 'vertical',
          from: '#687478',
          to: '#222222'
        }
      }, 

      data: data
    };

    ccchart.init('graph', chartdata);
  }).fail(function () {
    showError('情報の取得に失敗しました');
  });

  $('#notify').text('');

  return false;
}