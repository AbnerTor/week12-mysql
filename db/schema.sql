DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db; USE employee_tracker_db;

CREATE TABLE department ( id INT(5) AUTO_INCREMENT PRIMARY KEY, name VARCHAR(30) NOT NULL );

CREATE TABLE role ( id INT(5) AUTO_INCREMENT NOT NULL, title VARCHAR(30) NOT NULL, salary DECIMAL(10, 2) NOT NULL, department_id INT(5) NOT NULL, PRIMARY KEY (id) );

CREATE TABLE employee ( id INT(5) AUTO_INCREMENT NOT NULL, first_name VARCHAR(30) NOT NULL, last_name VARCHAR(30) NOT NULL, role_id INT(5) NOT NULL, manager_id INT(5), PRIMARY KEY (id) ); 