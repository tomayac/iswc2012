(function() {  
  
  // if set to true, verbous logging is enabled
  var DEBUG = true;
  // IDs of intervals used for polling for the existence of knowledge panels
  var POLLING_INTERVALS = [];
  var SPINNER = 'data:image/gif;base64,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';
  
  // global configuration data
  var GLOBAL_CONFIG = {
    GOOGLE_KEY: '',
    TESTING_KEY: 'AIzaSyDBpQBFYMroDQzh0HAq4YzB2bL9-AkRFcg'
  };
  
  // restore from options
  chrome.extension.sendRequest({item: "google_key"}, function(response) {
    GLOBAL_CONFIG.GOOGLE_KEY = response.reply || GLOBAL_CONFIG.GOOGLE_KEY;
    if ((GLOBAL_CONFIG.GOOGLE_KEY === '') ||
        (GLOBAL_CONFIG.GOOGLE_KEY === GLOBAL_CONFIG.TESTING_KEY)) {
      alert();
      GLOBAL_CONFIG.GOOGLE_KEY = GLOBAL_CONFIG.TESTING_KEY;
    }
  });
  
  // contains IDs, class names, and HTML for the knowledge panel
  var KNOWLEDGE_PANEL = {
    ID: 'knop',
    TITLE: 'kno-t',
    DESCRIPTION: 'kno-desc',
    CATEGORIES: 'kno-sh',
    CATEGORIES_DIV: function(node) {
      if (node.parentNode && node.parentNode.parentNode) {
        return node.parentNode.parentNode;
      } else {
        return false;
      }
    },
    SOCIAL_PANE: function(categoryName) {
      var html =
          '<div class="kno-fb-ctx">' +
            '<div class="kno-sb"></div>' +
            '<span class="kno-sh ellip">' + categoryName + '</span>' +
            '<div class="vrtr"></div>' +
          '</div>';
      return html;
    },

  // helper function for logging status messages
  var log = function(string) {
    if (DEBUG) {
      var prefix = '[Knowledge Panel Socializer] ';
      console.log(prefix + string);
    }
  };
  
  // checks if a knowledge panel exists on the current SERP
  var checkForKnowledgePanel = function() {
    var knowledgePanel = document.getElementById(KNOWLEDGE_PANEL.ID);
    if (knowledgePanel) {
      log('[*] A Knowledge Panel was detected.');

      // serves to react on navigation events from within the knowledge panel
      knowledgePanel.addEventListener('click', function(e) {
        if ((e.target.nodeName === 'A') ||
            (e.target.nodeName === 'IMG')) {
          log('Navigation event detected. About to load a new Knowledge Panel');
          setTimeout(function() {
            init();
          }, 500);
        }
      }, false);

      getConceptTitle(knowledgePanel);
      return true;
    } else {
      log('No Knowledge Panel was detected.');
      return false;
    }
  };
  
  // retrieves the concept categories, appends the realtime DIV
  var getConceptCategories = function(knowledgePanel, title, identifier) {
    var categoryPanes =
        knowledgePanel.getElementsByClassName(KNOWLEDGE_PANEL.CATEGORIES);
    if ((typeof categoryPanes === 'object') &&
        (categoryPanes.length >= 1)) {
      var categories = [];
      for (var i = 0, len = categoryPanes.length; i < len; i++) {
        categories[i] = categoryPanes[i].textContent.trim();
      }
      log('The following categories were detected: ' + categories);
      var socialTitle = chrome.i18n.getMessage('social_title');
    } else {
      log('Error: could not detect categories.');
    }
  };
  
  // retrieves the human-readable knowledge panel title
  var getConceptTitle = function(knowledgePanel) {
    var titlePane =
        knowledgePanel.getElementsByClassName(KNOWLEDGE_PANEL.TITLE);
    if ((typeof titlePane === 'object') &&
        (titlePane.length == 1)) {
      var title = titlePane[0].textContent.trim();
      log('The human-readable title is "' + title + '"');
      getConceptIdentifier(knowledgePanel, title);
    } else {
      log('Error: could not extract human-readable title.');
    }
  };
  
  // retrieves the concept identifier
  var getConceptIdentifier = function(knowledgePanel, title) {
    var descriptionPane =
        knowledgePanel.getElementsByClassName(KNOWLEDGE_PANEL.DESCRIPTION);
    if ((typeof descriptionPane === 'object') &&
        (descriptionPane.length == 1)) {
      var identifierLink = descriptionPane[0].querySelector('a');
      if (identifierLink) {
        var identifier = identifierLink.href;
        log('The identifier is ' + identifier);
        getConceptCategories(knowledgePanel, title, identifier);
      } else {
        log('Error: could not extract concept identifier.');
      }
    } else {
      log('Error: could not extract concept description.');
    }
  };
  
  // starts to poll for a knowledge panel
  var init = function() {
    log('Starting to poll for Knowledge Panel.');
    POLLING_INTERVALS.push(setInterval(function() {
      if (checkForKnowledgePanel()) {
        POLLING_INTERVALS.forEach(function(interval) {
          clearInterval(interval);
        });
        POLLING_INTERVALS = [];
        log('Stopping to poll for Knowledge Panel.');
      }
    }, 500));
  };
  
  // start polling for a knowledge panel if a navigation event occurs
  window.addEventListener('popstate', function() {
    setTimeout(function() {
      init();
    }, 500);
  }, false);
  
  init();
})();