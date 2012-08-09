<?php
  /**
   * @brief Outputs an error JSON with the format {"error" => $message}
   * @warning This function terminates the execution (runs exit())
   * @param {String} $error the message to output
   * @param {Int} $errno
   */
  function outputError ($error, $errno = null) {
    $object = array('error' => $error);
    if ($errno !== null) {
      $object['errno'] = $errno;
    }
    jsonOutput($object);
  }

  /**
   * @brief Outputs a JSON with the proper headers from the given array
   * @warning This function terminates the execution (runs exit())
   * @param {array} $arr the given array
   */
  function jsonOutput (array $arr) {
    if (!headers_sent()) {
      header('Cache-Control: no-cache, must-revalidate');
      header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
      header('Content-type:application/json');
      header('Content-attributes: application/json; charset=ISO-8859-15');
    }
    exit (json_encode($arr));
  }

  /**
   * Returns a JSON object with all the results from the mysql query
   * @param {MySQLI} $mysqli the resource to use
   */
  function sqlToJsonOutput ($mysqli) {
    if ($mysqli->error === '') {
      $result = $mysqli->store_result();
      if ($result) {
        jsonOutput($result->fetch_all(MYSQLI_ASSOC));
      } else {
        outputError('Empty result set');
      }
      $result->free();
    } else {
      outputError($mysqli->error, $mysqli->errno);
    }
  }

  /**
   * @brief Wraps var_export into a <pre></pre> tag for nice formatting
   * @param {mixed} [$arg_n]
   */
  function v_export () {
    $args = func_get_args();
    echo '<pre>';
    foreach ($args as $arg) {
      var_export ($arg);
      echo "\n";
    }
    echo '</pre>';
  }

?>