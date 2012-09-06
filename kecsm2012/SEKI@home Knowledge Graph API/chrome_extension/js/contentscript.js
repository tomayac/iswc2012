(function() {

  // if set to true, verbous logging is enabled
  var DEBUG = false;
  // IDs of intervals used for polling for the existence of knowledge panels
  var POLLING_INTERVALS = [];

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
  };

  // the remote end of the OKG
  var NAMESPACE = 'http://openknowledgegraph.org/';
  var DATA_URL = NAMESPACE + 'data/';
  var ONTOLOGY_URL = NAMESPACE + 'ontology/';
  var SERVER_URL = 'http://seki.code4fun.de/storage/';

  // contains IDs, class names, and HTML for the knowledge panel
  var KNOWLEDGE_PANEL = {
    ID: 'knop',
    TITLE: '.kno-t',
    DESCRIPTION: '.kno-desc',
    DEPICTION: '.kno-lilt.rhsl5 a',
    CATEGORIES: '.vrtr',
    CATEGORIES_VALUE: '.vrt a.fl.ellip',
    INLINE_CATEGORIES: '.kno-f',
    INLINE_CATEGORIES_NAME: 'span.kno-fh a',
    INLINE_CATEGORIES_VALUE: 'span.kno-fv'
  };

  // hard-coded triple for provenance
  var PROV = {
    PREDICATE: 'http://www.w3.org/ns/prov#wasDerivedFrom',
    OBJECT: 'http://www.google.com/insidesearch/features/search/knowledge.html'
  };

  // contains the mappings to other ontologies
  var CONTEXT_MAP = {
    NAME: 'http://xmlns.com/foaf/0.1/name',
    TOPIC_OF: {
      '@id': 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf',
      type: '@id'
    },
    FULL_NAME: 'http://xmlns.com/foaf/0.1/givenName',
    HEIGHT: 'http://dbpedia.org/ontology/height',
    SPOUSE: 'http://dbpedia.org/ontology/spouse',
    DEPICTION: 'http://xmlns.com/foaf/0.1/depiction'
  };

  // removes characters from start and end of strings
  String.prototype.multiTrim = function(characters) {
    characters = characters || ',';
    return this.replace(new RegExp('^[' + characters + ']+'), '')
        .replace(new RegExp('[' + characters + ']+$'), '');
  };

  // helper function for logging status messages
  var log = function() {
    var copyArray = function(array) {
      var newArray = [];
      for (var i = 0, len = array.length; i < len; ++i) {
        newArray[i] = array[i];
      }
      return newArray;
    };
    if (DEBUG) {
      var prefix = '[SEKI@home]';
      var args = copyArray(arguments);
      args.unshift(prefix);
      console.log.apply(console, args);
    }
  };

  // goes through all the keys and adds creates a context object
  function updateContext(context, object) {
    for (var key in object) {
      if (key.slice(0, 1) === '@') {
        // do something?
      } else {
        var keyUpperCase = key.toUpperCase();
        context[key] = context[key] || CONTEXT_MAP[keyUpperCase] ||
            ONTOLOGY_URL + key;
      }
    }
    return context;
  }

  // checks if a knowledge panel exists on the current SERP
  var checkForKnowledgePanel = function() {
    var knowledgePanel = document.getElementById(KNOWLEDGE_PANEL.ID);
    if (knowledgePanel) {
      log('A Knowledge Panel was detected.');

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

      var query = URI(window.location.href).query(true);
      query = query.stick ?
          query : URI('?' + URI(window.location.href).fragment()).query(true);
      if (query.stick) {
        var result = {
          '@id': DATA_URL + query.stick,
          '@context': { // this will be updated as new stuff gets added
            Derived_From: {
              '@id': PROV.PREDICATE,
              type: '@id'
            }
          },
          Topic_Of: getConceptIdentifier(knowledgePanel),
          Derived_From: PROV.OBJECT,
          Name: getConceptTitle(knowledgePanel),
          Depiction: getConceptDepiction(knowledgePanel)
        };

        for (var name in result) {
          if (result[name] === null) {
            log('Empty "' + name + '" in main result object');
            delete result[name];
          }
        }

        var categories = getConceptCategories( // TODO: complex
                           knowledgePanel,
                           getConceptInlineCategories(
                             knowledgePanel,
                             categories
                           )
                         );
        for (var name in categories) {
          if (categories[name].length === 0) {
            log('Empty category: "' + name + '"');
          } else {
            var newName = name.multiTrim(', ').replace(/\s+/g, '_');
            result[newName] = categories[name];
            if (categories[name] instanceof Array) {
              for (var i = 0, len = categories[name].length; i < len; ++i) {
                if (categories[name][i].constructor === Object) {
                  updateContext(result['@context'], categories[name][i]);
                }
              }
            } else {
              updateContext(result['@context'], categories[name]);
            }
          }
        }

        updateContext(result['@context'], result);

        log(JSON.stringify(result, null, 2));
        return result;
      } else {
        log('Error: no stick found.');
        return true;
      }
    } else {
      log('No Knowledge Panel was detected.');
      return false;
    }
  };

  var getConceptDepiction = function(knowledgePanel) {
    var links = getChildren(knowledgePanel, KNOWLEDGE_PANEL.DEPICTION);
    if (links) {
      return URI(links[0].href).query(true).imgurl || null;
    } else {
      log('No depiction found.');
    }
    return null;
  }

  // retrieves the human-readable knowledge panel title
  var getConceptTitle = function(knowledgePanel) {
    var titlePane = knowledgePanel.querySelector(KNOWLEDGE_PANEL.TITLE);
    if (titlePane) {
      var title = titlePane.textContent.multiTrim(', ');
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
      categoryNodes.forEach(function _getData(category) {
        var nameNode = category.previousSibling;
        if (nameNode && nameNode.nodeName === 'SPAN') {
          var name = nameNode.textContent.multiTrim(', ');
          var valueNodes = getChildren(category,
              KNOWLEDGE_PANEL.CATEGORIES_VALUE);
          if (valueNodes && valueNodes.length >= 1) {
            categories[name] = categories[name] || [];
            valueNodes.forEach(function _getValue(value) {
              var query = URI(value.href).query(true);
              key = {
                '@id': DATA_URL + query.stick,
                Query: query.q,
                Name: value.textContent.multiTrim(', ')
              };
              for (var kname in key) {
                if (!key[kname] || key[kname].length === 0) {
                  delete key[kname];
                }
              }
              updateContext(key);
              categories[name].push(key);
            });
          } else {
            log('Error: no values found for category ', category );
          }
        } else {
          log('Error: could not get title for category ', category);
        }
      });
      log('The following categories were detected: ', Object.keys(categories));
      return categories;
    } else {
      log('Error: could not detect categories.');
      return categories;
    }
  };

  // retrieves the concept identifier
  var getConceptIdentifier = function(knowledgePanel) {
    var descriptionPane =
        knowledgePanel.querySelector(KNOWLEDGE_PANEL.DESCRIPTION);
    if (descriptionPane) {
      var identifierLink = descriptionPane.querySelector('a');
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
      categoryNodes.forEach(function _extractCategories(category) {
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
            getChildren(valueNode).forEach(function _extractValues(value) {
              var key = null;
              if ((value.nodeType === NodeType.ELEMENT_NODE) &&
                  (value.nodeName === 'A')) {
                var query = URI(value.href).query(true);
                key = {
                  '@id': DATA_URL + query.stick,
                  Query: query.q,
                  Name: value.textContent.multiTrim(', ')
                };
              } else if (value.nodeType === NodeType.TEXT_NODE) {
                key = value.textContent
                    .replace(/\([^)]*\)/g, '')
                    .multiTrim(', ');
                key = key.length > 0 ? key : null;
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
            log('Error: no value found for inline category: "' + name + '"');
          }
        } else {
          log('Error: no inline category name found', category);
        }
      });
      return categories;
    } else {
      log('Error: no inline categories found')
    }
    return categories;
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
          for (var i = 0, len = children.length; i < len; ++i) {
            result.push(children[i]);
          }
          return result;
        }
      }
    }
    return null;
  }

  function handleResult(result) {
    return; // simply avoid scrobbling for now.
    log('Sending request to server', result);
    $.get(SERVER_URL, {
      data: JSON.stringify(result)
    }, function(response) {
      log('Server response', response);
    });
  }

  // starts to poll for a knowledge panel
  var init = function() {
    log('Starting to poll for Knowledge Panel.');
    POLLING_INTERVALS.push(setInterval(function() {
      var result = checkForKnowledgePanel();
      if (result) {
        POLLING_INTERVALS.forEach(function(interval) {
          clearInterval(interval);
        });
        POLLING_INTERVALS = [];
        log('Stopping to poll for Knowledge Panel.');

        // if the parsing has been successful
        if (result && result.constructor === Object) {
          handleResult(result);
        }
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