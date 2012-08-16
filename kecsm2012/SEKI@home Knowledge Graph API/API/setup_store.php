<?php

  require_once 'arc2/ARC2.php';
  require_once 'config.php';

  $store = ARC2::getStore(array(
    'db_host' => DB_HOST,
    'db_name' => DB_NAME,
    'db_user' => DB_USER,
    'db_pwd' => DB_PASS,
    'store_name' => DB_STORE_NAME
  ));

  if (!$store->isSetUp()) {
    $store->setUp();
  }

?>