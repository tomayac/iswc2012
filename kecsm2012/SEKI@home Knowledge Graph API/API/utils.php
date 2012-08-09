<?php

  /**
   * @param {MYSQLI} $mysqli
   * @param {String} $query
   * @param {String} $message
   * @param {Array} $object
   */
  function mysqliErrorOutput (
    $mysqli,
    $query = '',
    $message = '',
    array $object = null
  ) {
    $object = $object === null ? $ojbect : array();
    $errno = null;
    if (DEBUG) {
      $object['mysqli_error_list'] = $mysqli->error_list;
      $object['mysqli_info'] = $mysqli->info;
      if ($query !== null) {
        $object['query'] = $query;
      }
      $object['mysqli_error'] = $mysqli->error;
      $errno = $mysqli->errno;
    }
    outputError($message, $errno, $object);
  }

  /**
   * @brief Outputs an error JSON with the format {"error" => $message}
   * @warning This function terminates the execution (runs exit())
   * @param {String} $error the message to output
   * @param {Int} $errno
   * @param {Array} $object An array in which to append the error messages
   */
  function outputError ($error, $errno = null, array $object = null) {
    $object = $object ? $object : array();
    $object['error'] = $error;
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
    $json = json_encode($arr);
    if (DEBUG) {
      $json = json_indent($json);
    }
    exit($json);
  }

  /**
   * Returns a JSON object with all the results from the mysql query
   * @param {MySQLi} $mysqli the resource to use
   * @param {MySQLi_Result} $result
   */
  function sqlToJsonOutput ($mysqli, $result) {
    if ($mysqli->error === '') {
      if ($result !== false) {
        $arr = array();
        while ($row = $result->fetch_assoc()) {
          $arr[] = $row;
        }
        jsonOutput($arr);
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

  /**
   * Indents a flat JSON string to make it more human-readable.
   * @param {String} $json The original JSON string to process.
   * @param {String} $indentStr
   * @return {String} Indented version of the original JSON string.
   */
  function json_indent($json, $indentStr = '  ') {

    $result      = '';
    $pos         = 0;
    $strLen      = strlen($json);
    $newLine     = "\n";
    $prevChar    = '';
    $outOfQuotes = true;

    for ($i=0; $i<=$strLen; $i++) {

      // Grab the next character in the string.
      $char = substr($json, $i, 1);

      // Are we inside a quoted string?
      if ($char == '"' && $prevChar != '\\') {
          $outOfQuotes = !$outOfQuotes;

      // If this character is the end of an element,
      // output a new line and indent the next line.
      } else if(($char == '}' || $char == ']') && $outOfQuotes) {
        $result .= $newLine;
        $pos --;
        for ($j=0; $j<$pos; $j++) {
            $result .= $indentStr;
        }
      }

      // Add the character to the result string.
      $result .= $char;

      // If the last character was the beginning of an element,
      // output a new line and indent the next line.
      if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
        $result .= $newLine;
        if ($char == '{' || $char == '[') {
            $pos ++;
        }

        for ($j = 0; $j < $pos; $j++) {
            $result .= $indentStr;
        }
      }

      $prevChar = $char;
    }

    return $result;
  }

?>