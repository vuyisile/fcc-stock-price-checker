/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var Handler = require('../routes/handler.js');

module.exports = function (app) {
  
  var stockPriceHander = new Handler();

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query.stock;
      var like = req.query.like || false;
      var reqIP = req.connection.remoteAddress;
      var stockData = null;
      var likeData = null;
      var multiple = false;
      if (Array.isArray(stock)) {
        multiple = true;
        stockData = [];
        likeData = [];
      }
      function sync(finished, data) {
        if (finished == 'stockData') {
          (multiple) ? stockData.push(data) : stockData = data;
        } else {
          (multiple) ? likeData.push(data) : likeData = data;
        }
        
        if (!multiple && stockData && likeData !== null) {
          stockData.likes = likeData.likes;
          res.json({stockData});
        } else if (multiple && stockData.length == 2 && likeData.length == 2) {
          if (stockData[0].stock == likeData[0].stock) {
            stockData[0].rel_likes = likeData[0].likes - likeData[1].likes;
            stockData[1].rel_likes = likeData[1].likes - likeData[0].likes;
          } else {
            stockData[0].rel_likes = likeData[1].likes - likeData[0].likes;
            stockData[1].rel_likes = likeData[0].likes - likeData[1].likes;
          }
          res.json({stockData});
        }
      }
      if (multiple) {
        stockPriceHander.getData(stock[0], sync);
        stockPriceHander.loadLikes(stock[0], like, reqIP, sync); 
        stockPriceHander.getData(stock[1], sync);
        stockPriceHander.loadLikes(stock[1], like, reqIP, sync);
      } else {
        stockPriceHander.getData(stock, sync);
        stockPriceHander.loadLikes(stock, like, reqIP, sync);
      }
      
    });
    
};
