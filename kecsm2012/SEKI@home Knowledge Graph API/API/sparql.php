<?php

  header("Access-Control-Allow-Origin: *");

  require_once 'config.php';
  require_once 'utils.php';
  require_once 'jsonld/jsonld.php';
  require_once 'setup_store.php';

  if (isset($_REQUEST['query'])) {

    // mapping from format to extension
    $extensions = array(
      'xml' => 'xml',
      'sparql-results+xml' => 'xml',
      'json' => 'json',
      'sparql-results+json' => 'json',
      'php_ser' => 'json',
      'plain' => 'txt',
      'sql' => 'sql',
      'infos' => 'txt',
      'htmltab' => 'html',
      'tsv' => 'tsv'
    );

    $format = 'xml';
    if (!isset($_REQUEST['format'])) {
      // which accept headers to ignore
      $ignoreContentTypes = array('*', 'html', 'xml', 'xhtml+xml');

      $headers = apache_request_headers();
      $accept = explode(';', $headers['Accept']);
      $accept = explode(',', $accept[0]);

      foreach ($accept as $contentType) {
        $type = substr($contentType, strpos($contentType, '/') + 1);
        if (!in_array($type, $ignoreContentTypes)) {
          if (isset($extensions[$type])) {
            $format = $type;
            break;
          } else {
            // TODO: error or ignore?
          }
        }
      }
    } else if (isset($extensions[$_REQUEST['format']])) {
      $format = $_REQUEST['format'];
    }

    if (!headers_sent() && strlen($_REQUEST['query']) > 0) {
      $format = isset($_REQUEST['format']) ? trim($_REQUEST['format']) : 'xml';
      $extension = $format;
      foreach ($extensions as $key => $value) {
        if (preg_match('/^' . $key . '/i', $format)) {
          $extension = $value;
        }
      }
      $filename = 'openknowledgegraph_'.date('Y.m.d_H.i.s').".$extension";

      header('Content-type: text/plain');
      header("Content-Disposition:attachment;filename='$filename'");
    }

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