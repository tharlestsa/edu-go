CREATE USER 'caoedu'@'localhost' IDENTIFIED WITH mysql_native_password BY 'caoeducatep';
GRANT ALL PRIVILEGES ON *.* TO 'caoedu'@'localhost' WITH GRANT OPTION;
CREATE USER 'caoedu'@'%' IDENTIFIED WITH mysql_native_password BY 'caoeducatep';
GRANT ALL PRIVILEGES ON *.* TO 'caoedu'@'%' WITH GRANT OPTION;

CREATE DATABASE IF NOT EXISTS `CaoEdu` COLLATE 'utf8_general_ci' ;
GRANT ALL ON `CaoEdu`.* TO 'caoedu'@'%' ;
FLUSH PRIVILEGES ;