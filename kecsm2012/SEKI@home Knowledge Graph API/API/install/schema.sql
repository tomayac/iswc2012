
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oid` varchar(128),
  `name` varchar(128),
  `wiki` varchar(256),
  PRIMARY KEY (id),
  CONSTRAINT _oid UNIQUE (oid),
  CONSTRAINT _name UNIQUE (name),
  CONSTRAINT _wiki UNIQUE (wiki)
) AUTO_INCREMENT=1;

DROP TABLE IF EXISTS `predicates`;
CREATE TABLE `predicates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` varchar(128) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT _value UNIQUE (value)
) AUTO_INCREMENT=1;

DROP TABLE IF EXISTS `objects`;
CREATE TABLE `objects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` int(11) NOT NULL,
  `pid` int(11) NOT NULL,
  `value` varchar(128) NOT NULL,
  PRIMARY KEY (id),
  INDEX (sid),
  INDEX (pid),
  CONSTRAINT _uniqueTriple UNIQUE (sid, pid, value)
) AUTO_INCREMENT=1;