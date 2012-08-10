<?php

  class SEKIApi {

    const OID_REGEXP = '/^[a-zA-Z0-9_]+$/';
    const WIKI_REGEXP = '/^http:\/\/(www\.)?([a-zA-Z]+\.)?wikipedia.org\/.+$/';

    private $DB;
    private $columnTokensMap;

    /**
     * @param {MYSQLI} $mysqli The database to use
     */
    public function __construct ($mysqli) {
      $this->DB = $mysqli;
      $this->columnTokensMap = array(
        'oid' => array(TABLE_SUBJECTS, 'oid'),
        'wiki' => array(TABLE_SUBJECTS, 'wiki'),
        'name' => array(TABLE_SUBJECTS, 'name'),
        'predicates' => array(TABLE_PREDICATES, 'value'),
        'objects' => array(TABLE_OBJECTS, 'value')
      );
    }

    /**
     * Converts query to match the database schema
     * @param {String} query
     * @param {Array} $tables Convert only queries form this table
     * @return {String}
     * @example SEKIApi::convertColumns('oid, object as o');
     *           // will return: 'subjects.oid, objects.value as o'
     */
    private function convertColumns ($query, $tables = null) {
      $query = trim($query);
      $tokens = null;

      if ($query === '*') {
        $collection = array();
        foreach ($this->columnTokensMap as $find => $data) {
          list($table, $column) = $data;
          if ($tables && !in_array($table, $tables)) {
            continue;
          }
          $collection[] = "$table.$column";
        }
        return implode(', ', $collection);
      } else {
        foreach ($this->columnTokensMap as $find => $data) {
          list($table, $column) = $data;
          $query = preg_replace('/\b'.$find.'\b/', "$table.$column", $query);
        }
      }

      return $query;
    }

    /**
     * Converts column to match the database schemax
     * @param {String} $column
     * @return {String}
     */
    public function columnToken ($column) {
      if (isset($this->columnTokensMap[$column])) {
        return implode('.', $this->columnTokensMap[$column]);
      }
      return null;
    }

    /**
     * @param {String} $oid         Subject     - object id
     * @param {String} $wiki        Subject     - wikipedia.org url
     * @param {String} $name        Subject     - name
     * @param {String} $predicate   Predicate   -
     * @param {String} $object      Object      -
     * @return {Boolean}
     */
    public function get (
      $oid = null,
      $wiki = null,
      $name = null,
      $predicate = null,
      $objects = null,
      $columns = 'oid, wiki, name, predicates as pred, objects as obj'
    ) {
      $tables = array(TABLE_SUBJECTS, TABLE_PREDICATES, TABLE_OBJECTS);
      $filters = array();

      if ($oid !== null){
        if (preg_match(self::OID_REGEXP, $oid)) {
          $filters[] = $this->columnToken('oid')."='$oid'";
        } else {
          outputError("The specified Object ID `$oid` is invalid");
        }
      } else if ($wiki !== null) {
        // identify by wikipedia link
        if (preg_match(self::WIKI_REGEXP, $wiki)) {
          $filters[] = $this->columnToken('wiki')."='$wiki'";
        } else {
          outputError("The specified wikipedia URL `$wiki` is invalid");
        }
      } else if ($name !== null) {
        $filters[] = $this->columnToken('name')."='$name'";
      }

      if ($predicate !== null) {
        $filters[] = $this->columnToken('predicates')."='$predicate'";
      }

      if ($objects !== null) {
        $filters[] = TABLE_OBJECTS.'.sid='.TABLE_SUBJECTS.'.id';
        if ($predicate) {
          $filters[] = TABLE_OBJECTS.'.pid='.TABLE_PREDICATES.'.id';
        }
        if (is_array($objects)) {
          $filters[] = $this->columnToken('objects')
                        ." IN ('".implode("', '", $objects)."')";
        } else {
          $filters[] = $this->columnToken('objects')."='$objects'";
        }
      }

      $columns = $this->convertColumns($columns);
      $tables = implode(', ', $tables);
      $filters = implode(' AND ', $filters);

      $query = "SELECT $columns FROM $tables WHERE $filters";
      $result = $this->DB->query($query);
      if ($result !== false) {
        sqlToJsonOutput($this->DB, $result);
      } else {
        mysqliErrorOutput($this->DB, $query);
      }
    }

    /**
     * @param {String} $oid         Subject     - object id
     * @param {String} $wiki        Subject     - wikipedia.org url
     * @param {String} $name        Subject     - name
     * @param {String} $predicate   Predicate   -
     * @param {String} $object      Object      -
     * @return {Boolean}
     */
    public function insert (
      $oid = null,
      $wiki = null,
      $name = null,
      $predicate = null,
      $object = null
    ) {

      // at least one subject identifier
      if ($oid === null && $wiki === null && $name === null) {
        outputError('At least one identifier needed for the subject');
        return false;
      }

      // either specify both a predicate and an object or none of them
      if (!!$predicate xor !!$object) {
        outputError('Either specify a valid (predicate, object) tuple '
                      .'or do not specify any of them'
        );
      }

      $values = array();
      $update = array();

      // identify by oid
      if ($oid !== null) {
        if (preg_match(self::OID_REGEXP, $oid)) {
          $values['oid'] = $oid;
          $update[] = "oid='$oid'";
        } else {
          outputError("The specified Object ID `$oid` is invalid");
        }
      }

      // identify by wikipedia link
      if ($wiki !== null) {
        if (preg_match(self::WIKI_REGEXP, $wiki)) {
          $values['wiki'] = $wiki;
          $update[] = "wiki='$wiki'";
        } else {
          outputError("The specified wikipedia URL `$wiki` is invalid");
        }
      }

      // identify by name
      if ($name !== null) {
        $values['name'] = $name;
        $update[] = "name='$name'";
      }

      $update[] = 'id=LAST_INSERT_ID(id)';
      $queries['subject'] = "INSERT INTO "
                              .TABLE_SUBJECTS."("
                                .implode(', ', array_keys($values))
                              .") "
                              ."VALUES('".implode("', '", $values)."') "
                              ."ON DUPLICATE KEY UPDATE "
                                .implode(', ', $update).";";

      if ($this->DB->query($queries['subject'])) {
        $subject_id= mysqli_insert_id($this->DB);

        // update predicates table
        if ($predicate !== null) {
          $queries['predicate'] = "INSERT INTO "
                                    .TABLE_PREDICATES."(value) "
                                    ."VALUES('$predicate') "
                                    ."ON DUPLICATE KEY UPDATE "
                                      ."value='$predicate', "
                                      ."id=LAST_INSERT_ID(id);";
          if ($this->DB->query($queries['predicate']) === true) {
            $predicate_id = mysqli_insert_id($this->DB);
            $queries['object'] = "INSERT INTO "
                                    .TABLE_OBJECTS."(sid, pid, value) "
                                    ."VALUES('$subject_id', '$predicate_id', "
                                      ."'$object') "
                                    ."ON DUPLICATE KEY UPDATE "
                                      ."id=LAST_INSERT_ID(id);";
            if ($this->DB->query($queries['object']) === true) {
              return true;
            } else {
              mysqliErrorOutput($this->DB, $queries['object']);
            }
          } else {
            mysqliErrorOutput($this->DB, $queries['predicate']);
          }
        }
        return true;
      } else {
        mysqliErrorOutput($this->DB, $queries['subject']);
      }

      return false;
    }

  }

?>