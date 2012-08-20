
var left = JSON.parse(localStorage['google-navigator-left'] || '[]');
var visited = JSON.parse(localStorage['google-navigator-visited'] || '[]');
var method = JSON.parse(localStorage['google-navigator-method'] || '"queue"');
var timeout = JSON.parse(localStorage['google-navigator-timeout'] || '5');

chrome.tabs.onUpdated.addListener(function _addPageAction (tabId, change, tab) {
  if (change.status === 'loading') {
    if (/^(https?:\/\/)?(www\.)?google\.[a-z]{2,3}/.test(tab.url)){
      chrome.pageAction.show(tabId);
    }
  }
});

chrome.extension.onMessage.addListener(function (request, sender, sendResponse){
  switch (request.action) {
    case 'getData':
      sendResponse({
        method: method,
        left: left,
        visited: visited,
        timeout: timeout
      });
      break;
    case 'setTimeout':
      timeout = request.data;
      saveState();
      break;
    case 'setMethod':
      method = request.data;
      saveState();
      break;
    case 'visitLink':
      var pos = left.indexOf(request.data);
      if (pos > -1) {
        left.splice(pos, 1);
      }
      if (visited.indexOf(request.data) === -1) {
        visited.push(request.data);
      }
      saveState();
      break;
    case 'addLink':
      if (visited.indexOf(request.data) === -1 &&
          left.indexOf(request.data) === -1
      ) {
        left.push(request.data);
      }
      saveState();
      break;
    default:
      console.warn('Unknown action `' + request.action + '`');
  }
});

function saveState () {
  localStorage['google-navigator-method'] = JSON.stringify(method);
  localStorage['google-navigator-left'] = JSON.stringify(left);
  localStorage['google-navigator-visited'] = JSON.stringify(visited);
  localStorage['google-navigator-timeout'] = JSON.stringify(timeout);
}