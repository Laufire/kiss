<?php
	//set_error_handler("reportError");
	session_start();
	
	if(isset($_GET['params'])) //connect to the DB if the request has connection params
	{
		$params = $_GET['params'];
		
		$_SESSION['host'] = $params[0];
		$_SESSION['db'] = $params[1];
		$_SESSION['username'] = $params[2];
		$_SESSION['password'] = $params[3];
		
		$dbh = new PDO("mysql:host=$_SESSION[host];dbname=$_SESSION[db]", "$_SESSION[username]", "$_SESSION[password]", array(PDO::ATTR_PERSISTENT => true, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		
		if(!$dbh)
			respond('error', 'Unable to connect the DB.');
		else
			respond('message', 'Succesfully connected.');
	}
	else //disconnect from the DB if the request doesn't have connection params
	{
		session_destroy();
		respond('message', 'Succesfully disconnected.');
	}
	
	function respond($type, $data) //! withold the responses until all the processing is complete to ensure that data sent is in proper JSON
	{
		header('Content-Type: application/json');
		exit(json_encode(array('type' => $type, 'data' => $data), JSON_NUMERIC_CHECK));
	}
	
	function reportError()
	{
		respond('error', 'Unknown error.');
	}
?>