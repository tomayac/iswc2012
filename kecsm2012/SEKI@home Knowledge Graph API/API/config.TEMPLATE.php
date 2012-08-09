<?php

  define('DEBUG', TRUE);

  define('DB_USER', 'a_username');
  define('DB_PASS', 'a_password');
  define('DB_NAME', 'a_name');
  define('DB_HOST', 'localhost');

  define('TABLE_SUBJECTS', 'subjects');
  define('TABLE_PREDICATES', 'predicates');
  define('TABLE_OBJECTS', 'objects');


  $DB = mysqliConnect(DB_USER, DB_PASS, DB_NAME, DB_HOST);


  /**
   * @brief Returns a MSQLI Class database connection
   * @warning Dies if it is unable to make a connection
   * @param {string} $user
   * @param {string} $pass
   * @param {string} $name
   * @param {string} $host
   * @return {MYSQLI}
   */
  function msqliConnect($user, $pass, $name, $host = 'localhost'){
    $mysqli = new mysqli($host, $user, $pass, $name);

    /* check connection */
    if ($mysqli->connect_errno) {
      printf("Connect failed: %s\n", $mysqli->connect_error);
      exit();
    }

    return $mysqli;
  }

?>