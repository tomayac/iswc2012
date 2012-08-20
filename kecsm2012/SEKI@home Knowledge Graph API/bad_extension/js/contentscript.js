
/**
 * Change data.method to set the navigation type:
 * queue - FIFO
 * statck - LIFO
 * random - random
 */

(function Google_Navigator () {

  var left;
  var visited;
  var method;
  // timeout after which the page is redirected
  var navigateTimeout;

  $(function _onDocumentReady () {
    var blockNo = 0;
    updateData(function _newDataSet () {
      var interval = setInterval(function() {
        var $block = $('#rhs_block');
        if ($block.length > 0) {
          if ($block.attr('block-no') != blockNo) {
            $block.attr('block-no', ++blockNo);
            $('.kno-fv a')
              .add($('.vrt.kno-fb-ctx a.fl.ellip'))
              .each(function(){
                var link = $(this).attr('href');
                if (visited.indexOf(link) === -1) {
                  addLink(link);
                }
              });
          }
        }
      }, 1000);

      setTimeout(navigate, 2 * 1000);
    });
  });

  function navigate () {
    if (left.length > 0) {
      switch (method) {
        case 'stack':
          goToLink(left.length-1);
          break;
        case 'random':
          goToLink(Math.floor(Math.random() * left.length));
          break;
        default:
        case 'queue':
          goToLink(0);
          break;
      }
    } else {
      console.info('[Google Navigator] Nothing to do...');
      setTimeout(navigate, 2 * 1000);
    }
  }

  function updateData (callback) {
    callback = callback || function _noCallback () {};
    chrome.extension.sendMessage({action: 'getData'}, function _onData (data) {
      left = data.left;
      visited = data.visited;
      method = data.method;
      navigateTimeout = data.timeout * 1000;
      callback();
    });
  }

  function goToLink (index) {
    var link = left[index];
    if (visited.indexOf(link) === -1) {
      visitLink(index);
      console.warn('[Google Navigator] Going to (index: ' + index +
                      ', visited: ' + visited.length +
                      ', left: ' + left.length +
                      ', method: ' + method +
                      ', timeout: ' + navigateTimeout + '):',
                    link
      );
      setTimeout(function(){
        window.location.href = link;
      }, navigateTimeout);
    } else {
      navigate();
    }
  }

  function visitLink (index) {
    chrome.extension.sendMessage({
      action: 'visitLink',
      data: left[index]
    });
    visited.push(left[index]);
    left.splice(index, 1);
  }

  function addLink (link) {
    left.push(link);
    chrome.extension.sendMessage({
      action: 'addLink',
      data: link
    });
  }

})();