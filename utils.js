window.u = window.utils = {
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
    var winners = {};
    u.each(obj, function(val, key) {
      var boole = func(val, key);
      if (boole) winners[key] = val;
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
    if (u.nonEmpty(results)) return results;
  },
  mapObj: function(obj, func) {
    var results = {};
    u.each(obj, function(val, key) {
      var result = func(val, key);
      if (result) results[key] = result;
    });
    if (u.nonEmpty(results)) return results;
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
  loopRow: function(board, row, func) {
    var letters = ['a','b','c','d','e','f','g','h'],
      letter, name, square;
    for (var i = 0; i < letters.length; i++) {
      letter = letters[i];
      name = letter + row;
      square = board[name];
      // console.log('square', square  );
      func(square, i);
    }
  }
}