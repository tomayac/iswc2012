<?php

  header("Access-Control-Allow-Origin: *");

  require_once 'config.php';
  require_once 'utils.php';

  $url = 'http://seki.code4fun.de/sparql';
  $query = $_SERVER['argv'][0];
  if ($query && strlen($query) > 0) {
    $page = get_web_page($url . '?' . $query);
    if (!headers_sent()) {
      $headers = explode("\r\n", $page['headers']);
      foreach ($headers as $header) {
        header($header);
      }
    }
    echo $page['content'];
  } else {
    echo file_get_contents('sparql_help.html');
  }

?>
