<?php
  header("Access-Control-Allow-Origin: *");

  require_once '../config.php';
  require_once '../utils.php';
  require_once '../jsonld/jsonld.php';
  require_once '../arc2/ARC2.php';

  $graph_uri = 'http://openknowledgegraph.org';

  $jsonld_options = array(
    'format' => 'application/nquads'
  );

  $store = ARC2::getStore(array(
    'db_host' => DB_HOST,
    'db_name' => DB_NAME,
    'db_user' => DB_USER,
    'db_pwd' => DB_PASS,
    'store_name' => 'SEKI'
  ));

  if (!$store->isSetUp()) {
    $store->setUp();
  }

  $data = $_REQUEST;
  //cleanData($data);

  if ($data['data'] && $object = json_decode($data['data'])) {
    $rdf = jsonld_to_rdf($object, $jsonld_options);
    $query = "INSERT INTO <$graph_uri> { \n $rdf \n }";
    $store->query($query);
    //TODO: error checking and stuff
    jsonOutput(array(
      'triples' => count(explode("\n", $rdf))
    ));
  } else {
    outputError('No valid data object provided');
  }

?>