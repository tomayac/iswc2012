<?php

  header("Access-Control-Allow-Origin: *");

  require_once 'config.php';
  require_once 'utils.php';
  require_once 'jsonld/jsonld.php';
  require_once 'setup_store.php';

  $query = '';
  if (isset($_GET['query'])) {
    /* MySQL and endpoint configuration */
    $config = array(
      'db_host' => DB_HOST,
      'db_name' => DB_NAME,
      'db_user' => DB_USER,
      'db_pwd' => DB_PASS,
      'store_name' => 'SEKI',

      /* endpoint */
      'endpoint_features' => array(
        'select', 'construct', 'ask', 'describe',
        'load', 'insert', 'delete',
        'dump' /* dump is a special command for streaming SPOG export */
      ),
      'endpoint_timeout' => 60, /* not implemented in ARC2 preview */
      'endpoint_read_key' => '', /* optional */
      'endpoint_write_key' => '', /* optional */
      'endpoint_max_limit' => 512 /* optional */
    );

    /* instantiation */
    $ep = ARC2::getStoreEndpoint($config);
    if (!$ep->isSetUp()) {
      $ep->setUp(); /* create MySQL tables */
    }
    /* request handling */
    $ep->go();
  } else {
    echo file_get_contents("help.html");
  }

?>
