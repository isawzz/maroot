<?php

// --- HTTP headers ---
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

function db_connect() {
  if ($_SERVER['SERVER_NAME'] == "localhost") {
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "mychat_db";
  } else {
    $dbhost = 'db5004411681.hosting-data.io';
    $dbuser = 'dbu1710177';
    $dbpass = 'totalerMistDieserHost!';
    $dbname = 'dbs3676269';
  }
  if (!$con = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname)) {
    die("failed to connect!");
  } else {
    //echo '<p>Connection to MySQL server successfully established.</p>';
    return $con;
  }
}
function db_read($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  $rows = [];
	if ($result == false){
		return $rows;
	}
  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
  $con->close();
  return $rows;
}
function db_write_close($q) {
  $con = db_connect();
	$res = mysqli_query($con, $q);
	$id = mysqli_insert_id($con);
  $con->close();
	return $id;
}	
function db_write($q) {
  $con = db_connect();
	$res = mysqli_query($con, $q);
	$id = mysqli_insert_id($con);
	return $id;
}	
function db_write_read($qw,$qr){
	db_write($qw);
	$res = db_read($qr)[0];
	return $res;
}
function db_write_read_all($qw,$qr){
	db_write($qw);
	$res = db_read($qr);
	return $res;
}
function get_now(){
	return number_format(microtime(true)*1000,0,'.','');
}
function get_users(){
  $sql = "SELECT * FROM user ORDER BY `name`";
  $users = db_read($sql); 
	return $users;
}
function get_tables(){
  $sql = "SELECT * FROM gametable ORDER BY `modified` DESC";
  $tables = db_read($sql); 
	return $tables;
}
function pp($obj, $title = "hallo") {
  if (isset($title)) {
    echo "<br>$title:";
  }

  #echo "<pre>";
  print_r($obj);
  #cho "</pre>";
}





















