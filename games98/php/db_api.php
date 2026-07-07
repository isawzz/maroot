<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: *');

require_once 'helpers.php';

// $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
// echo $host;
// die;

// ---- Input handling ----
$input = json_decode(file_get_contents("php://input"), true) ?: [];
$action = $input['action'] ?? ($_GET['action'] ?? null);
$table = $input['table'] ?? ($_GET['table'] ?? null);
$id = $input['id'] ?? ($_GET['id'] ?? null);

if (!$action) {
	echo json_encode(['error' => 'No action specified']);
	exit;
}

// ---- DB Connection ----
$conn = dbConnect();
if (!$conn) {
	echo json_encode(['error' => 'DB Connection failed']);
	exit;
}

// ---- Helper function for output ----
function send($data, $code = 200)
{
	http_response_code($code);
	echo json_encode($data, JSON_PRETTY_PRINT);
	exit;
}
function decodeJsonColumns(array $row, array $columnsToDecode = ['action','expected', 'fen', 'notes', 'oldfen', 'options', 'players', 'plorder', 'turn'], array $columnsToInt = ['step', 'round'])
{
	// foreach ($columnsToDecode as $col) {
	// 	if (isset($row[$col]) && is_string($row[$col])) {
	// 		$decoded = json_decode($row[$col], true);
	// 		if (json_last_error() === JSON_ERROR_NONE) {
	// 			$row[$col] = $decoded;
	// 		}
	// 	}
	// }
	foreach ($row as $key => &$value) {
		// 🔹 Decode JSON-like columns only if they are in columnsToDecode
		if (in_array($key, $columnsToDecode, true) && is_string($value)) {
			$decoded = json_decode($value, true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
				$value = $decoded;
			}
		}

		// 🔹 Convert to integer if listed in columnsToInt
		if (in_array($key, $columnsToInt, true)) {
			$value = (int) $value;
		}
	}
	return $row;
}

// ---- Dispatch actions ----
switch ($action) {
	case 'get_database_tables':
		$res = $conn->query("SHOW TABLES");
		if (!$res)
			send(['error' => $conn->error], 500);
		$tables = [];
		while ($row = $res->fetch_row())
			$tables[] = $row[0];
		send($tables);
		break;

	case 'drop_table':
		if (!$table)
			send(['error' => 'Missing table'], 400);
		$ok = $conn->query("DROP TABLE `$table`");
		if (!$ok)
			send(['error' => $conn->error], 500);
		send(['success' => true, 'dropped_table' => $table]);
		break;

	case 'get_game_tables':
		$res = $conn->query("SELECT * FROM gametable");
		if (!$res)
			send(['error' => $conn->error], 500);
		$rows = [];
		while ($row = $res->fetch_assoc())
			$rows[] = decodeJsonColumns($row); // <-- decode JSON columns
		send($rows);
		break;

	case 'get_table':
		if (!$id)
			send(['error' => 'Missing id'], 400);
		$stmt = $conn->prepare("SELECT * FROM gametable WHERE id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$result = $stmt->get_result();
		$row = $result->fetch_assoc();
		if ($row)
			$row = decodeJsonColumns($row); // <-- decode JSON columns
		send($row ?: ['error' => 'Row not found']);
		break;

	case 'insert_row':
		if (!$table || empty($input['data']))
			send(['error' => 'Missing table or data'], 400);
		$data = $input['data'];
		$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
		$cols = implode(", ", array_keys($data));
		$placeholders = implode(", ", array_fill(0, count($data), "?"));
		$stmt = $conn->prepare("INSERT INTO `$table` ($cols) VALUES ($placeholders)");
		$types = str_repeat("s", count($data));
		$stmt->bind_param($types, ...array_values($data));
		$ok = $stmt->execute();
		send(['success' => $ok, 'insert_id' => $conn->insert_id]);
		break;

	case 'modify_row':
	case 'update_row':
		if (!$table || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];
		$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
		$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
		$stmt = $conn->prepare("UPDATE `$table` SET $set WHERE id = ?");
		$types = str_repeat("s", count($data)) . "i";
		$values = array_merge(array_values($data), [$id]);
		$stmt->bind_param($types, ...$values);
		$ok = $stmt->execute();

		// fetch the updated row to send back
		$stmt2 = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
		$stmt2->bind_param("i", $id);
		$stmt2->execute();
		$row = $stmt2->get_result()->fetch_assoc();
		if ($row && $table === 'gametable')
			$row = decodeJsonColumns($row); // decode JSON columns if gametable
		send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		break;

	case 'modify_row_fo':
	case 'update_row_fo':
		if (!$table || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];

		//get existing table from db
		$stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$row = $stmt->get_result()->fetch_assoc();
		//if step in existing table == $data["step"] then update
		if ($row['step'] == $data['step']) {
			//increment $data['step']
			$data['step'] = $row['step'] + 1;


			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
			$stmt = $conn->prepare("UPDATE `$table` SET $set WHERE id = ?");
			$types = str_repeat("s", count($data)) . "i";
			$values = array_merge(array_values($data), [$id]);
			$stmt->bind_param($types, ...$values);
			$ok = $stmt->execute();

			// fetch the updated row to send back
			$stmt2 = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			$row = $stmt2->get_result()->fetch_assoc();
			if ($row && $table === 'gametable')
				$row = decodeJsonColumns($row); // decode JSON columns if gametable
			send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		}else{
			if ($row && $table === 'gametable')
				$row = decodeJsonColumns($row); // decode JSON columns if gametable
			send(['success' => False, 'message' => 'too late!', 'row' => $row]);
		}
		break;
	case 'modify_row_fs':
	case 'update_row_fs':
		if (!$table || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];
		$success = $data['action']['success'];

		//get existing table from db
		$stmt = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$row = $stmt->get_result()->fetch_assoc();
		//if step in existing table == $data["step"] then update
    $valid1 = $data['step'] == $row['step'] && $success == True;
		$valid2 = $success == False;
		if ($valid1) {
			$data['step'] = $row['step'] + 1;
		}
		if ($valid1 || $valid2) {
			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
			$stmt = $conn->prepare("UPDATE `$table` SET $set WHERE id = ?");
			$types = str_repeat("s", count($data)) . "i";
			$values = array_merge(array_values($data), [$id]);
			$stmt->bind_param($types, ...$values);
			$ok = $stmt->execute();

			// fetch the updated row to send back
			$stmt2 = $conn->prepare("SELECT * FROM `$table` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			$row = $stmt2->get_result()->fetch_assoc();
			$row = decodeJsonColumns($row); 
			send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		}else{
			$row = decodeJsonColumns($row);
			send(['success' => False, 'message' => 'too late!', 'row' => $row]);
		}
		break;
	case 'delete_row':
		if (!$table || !$id)
			send(['error' => 'Missing table or id'], 400);
		$stmt = $conn->prepare("DELETE FROM `$table` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$ok = $stmt->execute();
		send(['success' => $ok, 'deleted_id' => $id]);
		break;


	default:
		send(['error' => "Unknown action: $action"], 400);
}

$conn->close();
?>