<?php
  header("Access-Control-Allow-Origin: *");

  spl_autoload_register(function ($class) {
      include 'classes/' . $class . '.class.php';
  });

  require_once 'config.php';
  require_once 'utils.php';

  $SEKI = new SEKIApi($DB);

  /*
  v_export($SEKI->insert(
    'Stefan',
    null,
    'watha fork!',
    'born',
    '26.08.1991'
  ));

  $SEKI->get('Stefan');
  */
?>