<?php

  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';
  require_once '../jsonld/jsonld.php';
  require_once '../setup_store.php';

  //$id_regexp = '/^[a-zA-Z0-9_]+$/';
  $id_regexp = '/.+/';

  $query = '';
  if (isset($_GET['q']) && preg_match($id_regexp, $_GET['q'])) {
    $ID = $_GET['q'];
    $url = "<http://openknowledgegraph.org/data/$ID>";
    $query = "SELECT ?predicate ?object WHERE {
       $url ?predicate ?object
    }";

    if ($rows = $store->query($query, 'rows')) {
      /* Serializer instantiation */
      $ser = ARC2::getTurtleSerializer();

      /* Serialize a triples array */
      $doc = $ser->getSerializedTriples($rows);
      v_export($doc);

      jsonOutput(array(
        'result' => $rows
      ));
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
    outputError('Invalid identifier');
  }

?>