'use strict';

var u = window.u = window.utils = {
  combine: function(arr1, arr2) {
    u.each(arr1, function(val1, i) {
      arr2[i] += val1;
    });
    return arr2;
  },
  compare: function(arr1, arr2) {
    u.each(arr1, function(val1, i) {
      arr2[i] -= val1;
    });
    return arr2;
  },
  extend: function() {
    var target = [].shift.call(arguments);
    u.each(arguments, function(obj) {
      u.each(obj, function(val, key) {
        target[key] = val;
      });
    });
    return target;
  },
  each: function(obj, func) {
    var keys = Object.keys(obj),
      i, key, val;
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      val = obj[key];
      func(val, key);
    }
  },
  filter: function(obj, func) {
    if (obj instanceof Array)
      return u.filterArr(obj, func);
    else
      return u.filterObj(obj, func);
  },
  filterArr: function(obj, func) {
    var winners = [];
    u.each(obj, function(val, key) {
      var boole = func(val, key);
      if (boole) winners.push(val);
    });
    // if (u.nonEmpty(winners))
    return winners;
  },
  filterObj: function(obj, func) {
    var winners = [];
    u.each(obj, function(val, key) {
      var boole = func(val, key);
      if (boole) winners.push(val);
    });
    // if (u.nonEmpty(winners))
    return winners;
  },
  map: function(obj, func) {
    if (obj instanceof Array)
      return u.mapArr(obj, func);
    else
      return u.mapObj(obj, func);
  },
  mapArr: function(obj, func) {
    var results = [];
    u.each(obj, function(val, key) {
      var result = func(val, key);
      if (result) results.push(result);
    });
    return results;
  },
  mapObj: function(obj, func) {
    var results = {};
    u.each(obj, function(val, key) {
      var result = func(val, key);
      if (result) results[key] = result;
    });
    return results;
  },
  nonEmpty: function(obj) {
    var keys = Object.keys(obj);
    if (keys.length) return true;
  },
  clone: function(obj) {
    if (obj instanceof Array)
      return u.extend([], obj);
    else
      return u.extend({}, obj);
  },
  getManEl: function(name, color) {
    var results = u.filter(chess.board, function(sq) {
      var man = sq.man || {};
      if (man.color === color && man.name === name) return true;
    });
    return results[0].el.children[0];
  },
  loopRank: function(board, rank, func) {
    var letters = ['a','b','c','d','e','f','g','h'],
      letter, name, square;
    for (var i = 0; i < letters.length; i++) {
      letter = letters[i];
      name = letter + rank;
      square = board[name];
      func(square, i, name);
    }
  },
  hasClass: function(el, className) {
    return el.classList.contains(className);
  },
  ajax: function(url, callback){
      var xmlhttp;
      // compatible with IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function(){
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
              callback(xmlhttp.responseText);
          }
      }
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
  }
}