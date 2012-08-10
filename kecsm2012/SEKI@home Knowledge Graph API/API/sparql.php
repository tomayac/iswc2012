<?php

  header("Access-Control-Allow-Origin: *");

  require_once 'config.php';
  require_once 'utils.php';
  require_once 'jsonld/jsonld.php';
  require_once 'setup_store.php';

  $query = '';
  if (isset($_GET['query'])) {
    $query = $_GET['query'];
    if ($rows = $store->query($query, 'rows')) {
      turtleOutput($store, $rows);
      /*
      jsonOutput(array(
        'result' => $rows
      ));
      */
    } else {
      if ($errors = $store->getErrors()) {
        jsonOutput(array(
          'errors' => $errors,
          'query' => $query
        ));
      } else {
        jsonOutput(array(
          'result' => array(),
          'error' => 'Empty result',
          'query' => $query
        ));
      }
    }
  } else {
    echo file_get_contents("help.html");
  }

?>
