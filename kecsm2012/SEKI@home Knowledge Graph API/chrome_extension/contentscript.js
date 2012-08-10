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
      GLOBAL_CONFIG.GOOGLE_KEY = GLOBAL_CONFIG.TESTING_KEY;
    }
  });

  // enum containing all Node.nodeType values
  var NodeType = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  }

  var SERVER = 'http://openknowledgegraph.org/';
  var ID_URL = SERVER + 'data/';

  // contains IDs, class names, and HTML for the knowledge panel
  var KNOWLEDGE_PANEL = {
    ID: 'knop',
    TITLE: 'kno-t',
    DESCRIPTION: 'kno-desc',
    CATEGORIES: '.vrtr',
    CATEGORIES_VALUE: '.vrt a.fl.ellip',
    INLINE_CATEGORIES: '.kno-f',
    INLINE_CATEGORIES_NAME: 'span.kno-fh a',
    INLINE_CATEGORIES_VALUE: 'span.kno-fv',
    CATEGORIES_DIV: function(node) {
      if (node.parentNode && node.parentNode.parentNode) {
        return node.parentNode.parentNode;
      } else {
        return false;
      }
    }
  }

  String.prototype.multiTrim = function (characters) {
    characters = characters || ',';
    return this.replace(new RegExp('^[' + characters + ']+'), '')
                .replace(new RegExp('[' + characters + ']+$'), '');
  }

  // helper function for logging status messages
  var log = function() {
    if (DEBUG) {
      var prefix = '[SEKI]';
      var args = copyArray(arguments);
      args.unshift(prefix);
      console.log.apply(console, args);
    }
  };

  var copyArray = function(array) {
    var newArray = [];
    for (var i=0; i<array.length; ++i) {
      newArray[i] = array[i];
    }
    return newArray;
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

      var query = URI('?' + URI(window.location.href).fragment()).query(true);
      if (query.stick) {
        var title = getConceptTitle(knowledgePanel);
        var wiki = getConceptIdentifier(knowledgePanel);
        var categories = getConceptCategories(
                            knowledgePanel,
                            getConceptInlineCategories(
                              knowledgePanel,
                              categories
                            )
                          );
        var result = {
          '@id': ID_URL + query.stick,
          Topic_Of: wiki,
          Name: title
        };

        for (var name in categories) {
          if (categories[name].length === 0) {
            log('Empty category: `' + name + '`');
          } else {
            var newName = name.multiTrim(', ').replace(/\s+/g, '_');
            result[newName] = categories[name];
          }
        }

        log(JSON.stringify(result, null, 2));
        return true;
      } else {
        log('Error: no stick found');
        return true;
      }
    } else {
      log('No Knowledge Panel was detected.');
      return false;
    }
  };

  // retrieves the human-readable knowledge panel title
  var getConceptTitle = function(knowledgePanel) {
    var titlePane =
        knowledgePanel.getElementsByClassName(KNOWLEDGE_PANEL.TITLE);
    if ((typeof titlePane === 'object') &&
        (titlePane.length == 1)) {
      var title = titlePane[0].textContent.multiTrim(', ');
      log('The human-readable title is "' + title + '"');
      return title;
    } else {
      log('Error: could not extract human-readable title.');
      return null;
    }
  };

  // retrieves the concept categories, appends the realtime DIV
  var getConceptCategories = function(knowledgePanel, categories) {
    var categoryNodes = getChildren(
      knowledgePanel,
      KNOWLEDGE_PANEL.CATEGORIES
    );
    if (categoryNodes && categoryNodes.length >= 1) {
      categories = categories || {};
      categoryNodes.forEach(function _getData (category) {
        var nameNode = category.previousSibling;
        if (nameNode && nameNode.nodeName === 'SPAN') {
          var name = nameNode.textContent.multiTrim(', ');
          var valueNodes = getChildren(category,
              KNOWLEDGE_PANEL.CATEGORIES_VALUE);
          if (valueNodes && valueNodes.length >= 1) {
            categories[name] = categories[name] || [];
            valueNodes.forEach(function _getValue (value) {
              var query = URI(value.href).query(true);
              key = {
                '@id': ID_URL + query.stick,
                query: query.q,
                text: value.textContent.multiTrim(', ')
              };
              if (value.title) {
                key.title = value.title;
              }
              for (var kname in key) {
                if (!key[kname] || key[kname].length === 0) {
                  delete key[kname];
                }
              }
              categories[name].push(key);
            });
          } else {
            log('Error: no values found for category ', category);
          }
        } else {
          log('Error: could not get title for category ', category);
        }
      });
      log('The following categories were detected: ', Object.keys(categories));
      return categories;
    } else {
      log('Error: could not detect categories.');
      return null;
    }
  };

  // retrieves the concept identifier
  var getConceptIdentifier = function(knowledgePanel) {
    var descriptionPane =
        knowledgePanel.getElementsByClassName(KNOWLEDGE_PANEL.DESCRIPTION);
    if ((typeof descriptionPane === 'object') &&
        (descriptionPane.length == 1)) {
      var identifierLink = descriptionPane[0].querySelector('a');
      if (identifierLink) {
        var identifier = identifierLink.href;
        log('The identifier is ' + identifier);
        return identifier;
      } else {
        log('Error: could not extract concept identifier.');
        return null;
      }
    } else {
      log('Error: could not extract concept description.');
      return null;
    }
  };

  var getConceptInlineCategories = function(knowledgePanel, categories) {
    var categoryNodes = getChildren(
      knowledgePanel,
      KNOWLEDGE_PANEL.INLINE_CATEGORIES
    );
    if (categoryNodes && categoryNodes.length >= 1) {
      categories = categories || {};
      categoryNodes.forEach(function _extractCategories (category) {
        var nameNode = getChildren(
          category,
          KNOWLEDGE_PANEL.INLINE_CATEGORIES_NAME,
          true
        );
        if (nameNode) {
          var name = nameNode.textContent.multiTrim(', ');
          var valueNode = getChildren(
            category,
            KNOWLEDGE_PANEL.INLINE_CATEGORIES_VALUE,
            true
          );
          if (valueNode) {
            categories[name] = categories[name] || [];
            getChildren(valueNode).forEach(function _extractValues (value) {
              var key = null;
              if (value.nodeType === NodeType.ELEMENT_NODE &&
                  value.nodeName === 'A'
              ) {
                var query = URI(value.href).query(true);
                key = {
                  '@id': ID_URL + query.stick,
                  query: query.q,
                  text: value.textContent.multiTrim(', '),
                  title: value.title
                };
              } else if (value.nodeType === NodeType.TEXT_NODE) {
                key = value.textContent
                            .replace(/\([^)]*\)/g, '')
                            .multiTrim(', ');
                key = key.length > 0 ? key : null;
              } else {
                // do nothing
              }
              if (key !== null) {
                for (var kname in key) {
                  if (!key[kname] || key[kname].length === 0) {
                    delete key[kname];
                  }
                }
                categories[name].push(key);
              }
            });
          } else {
            log('Error: no value found for inline category: `' + name + '`');
          }
        } else {
          log('Error: no inline category name found', category);
        }
      });
      return categories;
    } else {
      log('Error: no inline categories found')
    }
    return null;
  };

  /**
   * Gets one or more children of a node
   * @param {Node} node
   * @param {String} query If not specified, node.childNodes will be used
   * @param {Boolean} unique If the result should be unique or not
   * @returns {Node|Node Array} Note: if unique is false, the function returns
   *                              an Array of Nodes (not a NodeList)!
   */
  var getChildren = function(node, query, unique) {
    if (node) {
      var children;
      if (query) {
        children = node.querySelectorAll(query);
      } else {
        children = node.childNodes;
      }
      if (typeof children === 'object') {
        if (unique) {
          return children.length === 1 ? children[0] : null;
        } else {
          var result = [];
          for (var i = 0; i < children.length; ++i) {
            result.push(children[i]);
          }
          return result;
        }
      }
    }
    return null;
  }

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

})();