
/**
 * Change data.method to set the navigation type:
 * queue - FIFO
 * statck - LIFO
 * random - random
 */

(function Google_Navigator () {


  var server_url = 'http://seki.code4fun.de/navigator';
  // the minimum amount of links to find before they will be sent to the server
  var batch_size = 10;


  var found = JSON.parse(localStorage['links-found'] || '[]');
  var left = JSON.parse(localStorage['links-left'] || '[]');
  var visited = JSON.parse(localStorage['links-visited'] || '[]');
  var method;
  // timeout after which the page is redirected
  var navigateTimeout;

  $(function _onDocumentReady () {
    var blockNo = 0;
    if (visited.length >= batch_size) {
      $.post(server_url, {
        action: 'visitedLinks',
        links: visited
      });
      visited = [];
      saveState();
    }
    updateData(function _newDataSet () {
      navigate();
      setInterval(function _checkForNewBlock () {
        var $block = $('#rhs_block');
        if ($block.length > 0) {
          if ($block.attr('block-no') != blockNo) {
            $block.attr('block-no', ++blockNo);
            $('.kno-fv a')
              .add($('.vrt.kno-fb-ctx a.fl.ellip'))
              .each(function(){
                var query = URI($(this).attr('href')).query(true);
                if (query.q) {
                  var link = '/search?q=' + query.q + '&stick=' + query.stick;
                  if (found.indexOf(link) === -1) {
                    found.push(link);
                  }
                }
              });
            saveState();
          }
        }
        sendResult();
      }, 1000);
    });
  });

  function sendResult (force) {
    if (found.length >= batch_size || (force && found.length > 0)) {
      console.log('[Google Navigator] Sending findings (' + found.length + ')',
                  found
      );
      $.post(server_url, {
        action: 'addLinks',
        links: found
      }, function _statusUpdate (result) {
        console.log(result);
      }).error(function _onError (){
        console.log(arguments);
      });
      found = [];
      saveState();
    }
  }

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
      console.log('[Google Navigator] Nothing to do! Fetching more liks ...');
      var options = {
        action: 'getLinks'
      };
      $.post(server_url, options, function _moreLinksUpdate (res) {
        if (res && res.urls && res.urls.length > 0) {
          left = res.urls;
          saveState();
          navigate();
        } else {
          var t = 60;
          console.log('[Google Navigator] Trying again in ' + t + ' seconds');
          setTimeout(navigate, t * 1000);
        }
      });
    }
  }

  function updateData (callback) {
    callback = callback || function _noCallback () {};
    chrome.extension.sendMessage({action: 'getData'}, function _onData (data) {
      method = data.method;
      navigateTimeout = data.timeout * 1000;
      callback();
    });
  }

  function goToLink (index) {
    var link = left[index];
    visitLink(index);
    console.log('[Google Navigator] Going to (index: ' + index +
                    ', visited: ' + visited.length +
                    ', left: ' + left.length +
                    ', method: ' + method +
                    ', timeout: ' + navigateTimeout + '):',
                  link
    );
    setTimeout(function(){
      window.location.href = link;
    }, navigateTimeout);
  }

  function visitLink (index) {
    chrome.extension.sendMessage({
      action: 'visitLink',
      data: left[index]
    });
    visited.push(left[index]);
    left.splice(index, 1);
    saveState();
  }

  function saveState () {
    localStorage['links-left'] = JSON.stringify(left);
    localStorage['links-visited'] = JSON.stringify(visited);
    localStorage['links-found'] = JSON.stringify(found);
  }

})();