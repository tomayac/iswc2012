<?php

  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';

  if (isset($_GET['query'])) {
    $url = 'http://seki.code4fun.de/data/' . $_GET['query'];
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
