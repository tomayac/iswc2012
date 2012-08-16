<?php

  require_once 'config.php';
  require_once 'utils.php';

  $DB = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

  if ($DB->connect_error) {
      die('Connect Error (' . $DB->connect_errno . ') '
              . $DB->connect_error);
  }

  $query_last = 'SELECT
                        T.t as total,
                        S.val AS subject,
                        P.val AS predicate,
                        O.val AS object
                  FROM  ' . DB_STORE_NAME . '_triple T,
                        ' . DB_STORE_NAME . '_s2val S,
                        ' . DB_STORE_NAME . '_o2val O,
                        ' . DB_STORE_NAME . '_id2val P
                  WHERE T.s=S.id AND T.p=P.id AND T.o=O.id
                  ORDER BY T.t DESC
                  LIMIT 0, 1';

  $result = $DB->query($query_last);

  if ($result) {
    $row = $result->fetch_assoc();
    if (count($row) > 0) {
      jsonOutput($row);
    } else {
      jsonOutput(array());
    }
  } else {
    mysqliErrorOutput($DB, $query, 'Error occured');
  }

?>