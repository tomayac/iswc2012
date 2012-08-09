
DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  `wiki` varchar(128) NOT NULL,
  PRIMARY KEY (id),
  INDEX (sid),
  INDEX (name),
  INDEX (wiki),
  CONSTRAINT _sid UNIQUE (sid),
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
  INDEX (value),
  CONSTRAINT _value UNIQUE (value)
) AUTO_INCREMENT=1;