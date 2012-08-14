<?php

  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';

  if (isset($_GET['query'])) {
    $dirname = dirname($_SERVER['REQUEST_URI']);
    $base = implode('/', array_slice(explode('/', $dirname), 0, -1));
    $query = 'SELECT ?predicate ?object ' .
              "WHERE { \n" .
                '<http://openknowledgegraph.org/data/'.$_REQUEST['query'].">\n".
                " ?predicate ?object . \n".
              '}';
    $url = WEB_ROOT . $base . '/sparql.php?query=' . urlencode($query);
    $page = get_web_page($url);
    if (!headers_sent()) {
      $headers = explode("\r\n", $page['headers']);
      foreach ($headers as $header) {
        header($header);
      }
    }
    echo $page['content'];
  } else {
    outputError('Invalid identifier');
  }

?>
