<?php
  header("Access-Control-Allow-Origin: *");

  spl_autoload_register(function ($class) {
      include 'classes/' . $class . '.class.php';
  });

  require_once 'config.php';
  require_once 'utils.php';

  $SEKI = new SEKIApi($DB);


  $SEKI->get(null, null, null, null, '13.08.2010');
?>