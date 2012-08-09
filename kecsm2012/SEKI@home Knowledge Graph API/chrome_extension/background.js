chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  sendResponse({
    reply: localStorage.getItem(request.item)
  });
});