<?php

  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';
  
  $format = 'turtle';
  if (isset($_GET['query'])) {
    $dirname = dirname($_SERVER['REQUEST_URI']);
    $base = implode('/', array_slice(explode('/', $dirname), 0, -1));
    $subject = '<http://openknowledgegraph.org/data/' . $_REQUEST['query'] . '>';
    $query = 'CONSTRUCT {' . "\n" .
                "$subject ?predicate ?object \n" .
              "}\n" .
              "WHERE { \n" .
                "$subject ?predicate ?object .\n" .
              '}';
    $url = WEB_ROOT . $base . '/sparql.php?format='.$format.'&query=' . urlencode($query);
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
