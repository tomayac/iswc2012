<?php

  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';
  require_once '../jsonld/jsonld.php';
  require_once '../setup_store.php';

  if (isset($_GET['query'])) {
    $dirname = dirname($_SERVER['REQUEST_URI']);
    $base = implode('/', array_slice(explode('/', $dirname), 0, -1));
    $url = WEB_ROOT . $base . '/sparql.php?query=' .
                      urldecode(
                        'SELECT ?predicate ?object WHERE { ' .
                          $_GET['query'] . ' ?predicate ?object ' .
                        '}'
                      );
    v_export($url);
    echo '<hr />';
    $page = get_web_page($url);
    echo $page['content'];
  } else {
    outputError('Invalid identifier');
  }

?>
