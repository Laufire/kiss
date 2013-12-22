<?PHP
	set_error_handler("reportError");
	session_start();
	
	if(isset($_GET['command']))
	{
		$params = array();
		
		if(isset($_GET['params']))
			$params = $_GET['params'];
		
		$query = "CALL $_GET[command](" . rtrim(str_repeat("?,", count($params)), ',') .');';
		
		$dbh = new PDO("mysql:host=$_SESSION[host];dbname=$_SESSION[db]",
			"$_SESSION[username]", "$_SESSION[password]",
			array(PDO::ATTR_PERSISTENT => true,
			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		
		try //is used to catch custom MySQL errors
		{
			$stmt = $dbh->prepare($query); 
			$stmt->execute($params);
			
			for ($i = 0; $i < $stmt->columnCount(); $i++) //get the column names
			{
				$col = $stmt->getColumnMeta($i);
				$fields[] = $col['name'];
			}
			
			respond('table', array('fields' => $fields, 'rows' => $stmt->fetchAll(PDO::FETCH_NUM)));
		}
		catch(Exception $e)
		{
			$err = $stmt->errorInfo();
			
			if($err[1] == 1644) //the error is a custom error returned by the procedure
				respond('error', $stmt->errorInfo()[2]);
			else
				reportError();
		}
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