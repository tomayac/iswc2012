
var visited = JSON.parse(localStorage['google-navigator-visited'] || '0');
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
      ++visited;
      saveState();
      break;
    default:
      console.warn('Unknown action `' + request.action + '`');
  }
});

function saveState () {
  localStorage['google-navigator-method'] = JSON.stringify(method);
  localStorage['google-navigator-visited'] = JSON.stringify(visited);
  localStorage['google-navigator-timeout'] = JSON.stringify(timeout);
}