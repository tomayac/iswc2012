
var methods = ['random', 'queue', 'stack'];

// background page data
var method;
var left;
var visited;

// DOM elements
var options;
var stats = {
  wrapper: null,
  left: null,
  visited: null,
  preview: null
};

window.onload = function () {
  options = document.getElementById('options');
  stats.wrapper = document.getElementById('stats');
  stats.left = document.getElementById('stats-left');
  stats.visited = document.getElementById('stats-visited');
  stats.preview = document.getElementById('stats-preview');

  updateData(function _onNewData () {
    options.innerHTML = '';
    options.appendChild(document.createTextNode('Method type: '));
    for (var i=0; i<methods.length; ++i) {
      var link = document.createElement('a');
      link.href = 'javascript:void(0)';
      link.id = 'method-' + i;
      link.innerHTML = methods[i];
      link.onclick = (function(index){
        return function _onClick () {
          setMethod(index);
        }
      })(i);
      options.appendChild(link);
      if (methods[i] === method) {
        selectLink(i);
      }
      if (i < methods.length-1) {
        options.appendChild(document.createTextNode(' | '));
      }
    }
  });

  setInterval(function () {
    updateData();
    updateStats();
  }, 500);
}

function updateStats () {
  stats.left.innerHTML = left.length;
  stats.visited.innerHTML = visited.length;

  var previewCount = 5;
  stats.preview.innerHTML = '';
  var preview = left.slice(0, previewCount);
  if (left.length > previewCount) {
    if (left.length >= previewCount * 2) {
      preview = preview.concat(left.slice(-previewCount));
    } else {
      preview = preview.concat(left.slice(previewCount));
    }
  }
  for (var i=0; i<preview.length; ++i) {
    var query = URI(preview[i]).query(true).q;
    var li = document.createElement('li');
    console.log(preview[i]);
    li.innerHTML = '<a href="https://google.com' + preview[i] +
                      '" target="_blank">' + query + '</a>';
    stats.preview.appendChild(li);
    if (i+1 === previewCount) {
      var separator = document.createElement('li');
      separator.innerHTML = '...';
      stats.preview.appendChild(separator);
    }
  }
}

function updateData (callback) {
  callback = callback || function _noCallback () {};
  chrome.extension.sendMessage({action: 'getData'}, function _onData (data) {
    left = data.left;
    visited = data.visited;
    method = data.method;
    callback();
  });
}

function setMethod (index) {
  chrome.extension.sendMessage({
    action: 'setMethod',
    data: methods[index]
  });

  var selected = options.getElementsByClassName('selected');
  for (var i=0; i<selected.length; ++i) {
    selected[i].className = '';
  }
  selectLink(index);
}

function selectLink (index) {
  document.getElementById('method-'+index).className = 'selected';
}