<?php

  define('DB_USER', 'a_username');
  define('DB_PASS', 'a_password');
  define('DB_NAME', 'a_name');
  define('DB_HOST', 'localhost');


  dbConnect(DB_USER, DB_PASS, DB_NAME, DB_HOST);


  /**
   * @brief Perform a database connection
   * @warning Dies if it is unable to make a connection
   * @param {string} $user
   * @param {string} $pass
   * @param {string} $name
   * @param {string} $host
   */
  function dbConnect($user, $pass, $name = null, $host = 'localhost'){
    $connexion = mysql_connect( $host, $user, $pass ) or die ("Could not connect to Data Base!");
    if( $name ) mysql_select_db( $name, $connexion ) or die ("Failed to select Data Base");
  }

?>