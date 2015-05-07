'use strict';

// DAParser
// --------
// data api 解析器，提供对单个 element 的解析，可用来初始化页面中的所有 Widget 组件。
// fork from:
//  - https://github.com/aralejs/widget/blob/master/src/daparser.js

// Helpers
// ------

var RE_DASH_WORD = /-([a-z])/g;
var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/;

// 将 'false' 转换为 false
// 'true' 转换为 true
// '3253.34' 转换为 3253.34
function normalizeValue(val) {
  if (val.toLowerCase() === 'false') {
    val = false;
  } else if (val.toLowerCase() === 'true') {
    val = true;
  } else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
    var number = parseFloat(val);
    if (number + '' === val) {
      val = number;
    }
  }

  return val;
}

// 解析并归一化配置中的值
function normalizeValues(data) {
  Object.keys(data).forEach(function(key) {
    var val = data[key];

    if (typeof val === 'string') {
      data[key] = JSON_LITERAL_PATTERN.test(val) ?
        normalizeValues(JSON.parse(val.replace(/'/g, '"'))) :
        normalizeValue(val);
    }
  });

  return data;
}

// 仅处理字母开头的，其他情况转换为小写："data-x-y-123-_A" --> xY-123-_a
function camelCase(str) {
  return str.toLowerCase().replace(RE_DASH_WORD, function(all, letter) {
    return (letter + '').toUpperCase();
  });
}

// 得到某个 DOM 元素的 dataset
exports.parseElement = function(element, raw) {
  var dataset = {};
  var attrs = {};

  // ref: https://developer.mozilla.org/en/DOM/element.dataset
  if (element.dataset) {
    // 转换成普通对象
    Object.keys(element.dataset).forEach(function(key) {
      dataset[key] = element.dataset[key];
    });
  } else if ((attrs = element.attributes)) {
    Array.prototype.forEach.call(element.attributes, function(attr) {
      if (attr.name.indexOf('data-') === 0) {
        dataset[camelCase(attr.name.substring(5))] = attr.value;
      }
    });
  }

  return raw === true ? dataset : normalizeValues(dataset);
};
