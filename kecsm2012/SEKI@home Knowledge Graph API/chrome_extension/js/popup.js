
var stats_url = 'http://seki.code4fun.de/stats';
var interval = 5 * 1000;

var lastTotal = -1;
$(function _popupWindowOnLoad () {

  var $total = $('#total');
  var $lastTriples = $('#lastTriples');

  updateInfo();
  updateInterval = setInterval(updateInfo, interval);

  function updateInfo () {
    $.get(stats_url, function _onResponse (result) {
      if (result.total === lastTotal) {
        return;
      }
      lastTotal = result.total;
      if (result.subject) {
        var middle = result.subject.lastIndexOf('/') + 1;
        result.subject = '&lt;<a href="'+result.subject+'" target="_blank" ' +
                            'title="click to download" >' +
                            result.subject.slice(0, middle) + ' ' +
                            result.subject.slice(middle) +
                          '</a>&gt;';
      }

      $total.html(result.total);
      var wrapper = $(document.createElement('tbody'));
      wrapper.attr('id', result.total).addClass('triple');
      delete result.total;

      for (var key in result) {
        if (/^https?:\/\//i.test(result[key])) {
          result[key] = '&lt;' + result[key] + '&gt;';
        }
        wrapper.append( '<tr>' +
                          '<td>' + key + '</td>' +
                          '<td class="'+ key +'">' + result[key] +
                        '</td>'
        );
      }

      $lastTriples.append(wrapper);
    });
  }

});