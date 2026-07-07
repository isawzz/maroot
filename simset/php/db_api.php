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
// $data = $input['data'];

$cmd = $input['cmd'] ?? ($_GET['cmd'] ?? null);
$dbTableName = $input['table'] ?? ($_GET['table'] ?? null);
$id = $input['id'] ?? ($_GET['id'] ?? null);

if (!$cmd) {
	echo json_encode(['error' => 'No action specified']);
	exit;
}

// ---- DB Connection ----
$conn = dbConnect();
if (!$conn) {
	echo json_encode(['error' => 'DB Connection failed']);
	exit;
}
//echo json_encode(['msg' => $_SERVER['HTTP_HOST']]); die;

// ---- Helper function for output ----
function send($data, $code = 200)
{
	http_response_code($code);
	echo json_encode($data, JSON_PRETTY_PRINT);
	exit;
}
function decodeJsonColumns(array $data)
{
	foreach ($data as $key => &$value) {
		// 1. If it's a string, try to decode it or turn it into a number
		if (is_string($value)) {

			// --- Check for JSON ---
			// A quick check: does it look like a JSON object or array?
			$trimmed = trim($value);
			if ($trimmed !== '' && ($trimmed[0] === '{' || $trimmed[0] === '[')) {
				$decoded = json_decode($value, true);
				if (json_last_error() === JSON_ERROR_NONE) {
					// It was JSON! Now, run THIS function on the decoded result 
					// to catch any nested JSON strings.
					$value = is_array($decoded) ? decodeJsonColumns($decoded) : $decoded;
					continue;
				}
			}

			// --- Check for Numbers ---
			if (is_numeric($value)) {
				$value = (strpos($value, '.') !== false) ? (float) $value : (int) $value;
			}
		}
		// 2. If it's already an array (but not a string), recurse into it
		else if (is_array($value)) {
			$value = decodeJsonColumns($value);
		}
	}
	return $data;
}
// ---- Dispatch actions ----
switch ($cmd) {
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
		if (!$dbTableName)
			send(['error' => 'Missing table'], 400);
		$ok = $conn->query("DROP TABLE `$dbTableName`");
		if (!$ok)
			send(['error' => $conn->error], 500);
		send(['success' => true, 'dropped_table' => $dbTableName]);
		break;

	case 'get_game_tables':
		$res = $conn->query("SELECT * FROM gametable");
		if (!$res)
			send(['error' => $conn->error], 500);
		$rows = [];
		while ($row = $res->fetch_assoc())
			$rows[] = decodeJsonColumns($row); // <-- decode JSON columns

		$res = $conn->query("SELECT * FROM game_sync");
		if (!$res)
			send(['error' => $conn->error], 500);
		$rows2 = [];
		while ($row = $res->fetch_assoc())
			$rows2[] = decodeJsonColumns($row); // <-- decode JSON columns

		// send($rows);
		// break;
		send([
			'tables' => $rows,
			'moves' => $rows2
		]);
		break;

	case '_get_table':
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

	case 'get_table':
		$id = (int) $input['id'];

		// 1. Fetch the main game table
		$res = $conn->query("SELECT * FROM gametable WHERE id = $id");
		$tableData = $res->fetch_assoc();
		if (!$tableData)
			send(['error' => 'Table not found'], 404);

		$table = decodeJsonColumns($tableData);

		// 2. Fetch ALL sync records for this game
		// This returns a list of everyone who has already clicked "Submit"
		$syncRes = $conn->prepare("SELECT player_id, has_moved FROM game_sync WHERE game_id = ? AND has_moved = 1");
		$syncRes->bind_param("i", $id);
		$syncRes->execute();
		$rows = $syncRes->get_result()->fetch_all(MYSQLI_ASSOC);

		// Convert to a simple list of names: ["Alice", "Bob"]
		$movedPlayers = array_column($rows, 'player_id');

		send([
			'table' => $table,
			'movedPlayers' => $movedPlayers
		]);
		break;
	case 'insert_row':
		if (!$dbTableName || empty($input['data']))
			send(['error' => 'Missing table or data'], 400);
		$data = $input['data'];
		$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
		$cols = implode(", ", array_keys($data));
		$placeholders = implode(", ", array_fill(0, count($data), "?"));
		$stmt = $conn->prepare("INSERT INTO `$dbTableName` ($cols) VALUES ($placeholders)");
		$types = str_repeat("s", count($data));
		$stmt->bind_param($types, ...array_values($data));
		$ok = $stmt->execute();
		send(['success' => $ok, 'insert_id' => $conn->insert_id]);
		break;

	case 'modify_row':
	case 'update_row':
		if (!$dbTableName || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];
		$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
		$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
		$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ?");
		$types = str_repeat("s", count($data)) . "i";
		$values = array_merge(array_values($data), [$id]);
		$stmt->bind_param($types, ...$values);
		$ok = $stmt->execute();

		// fetch the updated row to send back
		$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
		$stmt2->bind_param("i", $id);
		$stmt2->execute();
		$row = $stmt2->get_result()->fetch_assoc();
		if ($row && $dbTableName === 'gametable')
			$row = decodeJsonColumns($row); // decode JSON columns if gametable
		send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		break;

	case '___modify_row_all':
	case '___update_row_all':
		if (!$dbTableName || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);

		$data = $input['data'];
		$playerId = $input['player_id'] ?? null;
		$clientStep = (int) $data['step'];

		if (!$playerId) {
			send(['error' => 'Missing player_id'], 400);
			return;
		}

		// 1. Atomic JSON Insert: Add player move to pending_actions if step matches
		$actionJson = json_encode($data['action']);
		$stmt = $conn->prepare("
			UPDATE `$dbTableName` 
			SET pending_actions = JSON_SET(IFNULL(pending_actions, '{}'), '$.\"$playerId\"', ?)
			WHERE id = ? AND step = ?
		");
		$stmt->bind_param("sii", $actionJson, $id, $clientStep);
		$stmt->execute();

		if ($conn->affected_rows === 0) {
			send(['error' => 'Step mismatch or row not found'], 409);
		}

		// 2. Fetch current state to check if we are the last player
		$stmt = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$row = $stmt->get_result()->fetch_assoc();

		$pending = json_decode($row['pending_actions'] ?? '{}', true);
		$players = json_decode($row['players'] ?? '[]', true);
		if (count($pending) >= count($players)) {
			// --- ALL MOVES RECEIVED: Finalize the round ---
			$data['step'] = $clientStep + 1;
			$data['pending_actions'] = null;
			$data['last_round_results'] = $pending;

			// Remove player_id from the data array so it doesn't try to save to a non-existent column
			unset($data['player_id']);

			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data);
			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));

			// We add WHERE step = ? to ensure no one else finalized while we were processing
			$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ? AND step = ?");

			// FIX: Correctly map types and values for the splat operator
			$types = str_repeat("s", count($data)) . "ii";
			$values = array_merge(array_values($data), [$id, $clientStep]);
			$stmt->bind_param($types, ...$values);
			$stmt->execute();

			// Fetch the final state to return
			$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			send(['success' => true, 'status' => 'completed', 'row' => decodeJsonColumns($stmt2->get_result()->fetch_assoc())]);
		} else {
			// --- STILL WAITING ---
			send(['success' => true, 'status' => 'waiting', 'count' => count($pending)]);
		}
		break;
	case '____modify_row_all':
	case '____update_row_all':
		if (!$dbTableName || !$id || empty($input['data'])) {
			send(['error' => 'Missing table, id or data'], 400);
		}

		$data = $input['data']; //this is the game table!!!!!

		$playerId = $input['player_id'] ?? null;
		$clientStep = (int) ($data['step'] ?? 0);
		//$actionJson = json_decode($data['action'] ?? []);

		$actionJson = json_encode($data['action']);
		$turn = json_encode($data['turn']);

		// send(['actionJson' => $actionJson]);
		// die;

		if (!$playerId) {
			send(['error' => 'Missing player_id'], 400);
		}

		// 1. ATOMIC UPDATE: Insert this player's move into the pending_actions JSON object.
		// We use JSON_SET with IFNULL to ensure the dictionary exists.
		// The path '$.\"$playerId\"' uses quotes to handle usernames with spaces/special chars.
		// $stmt = $conn->prepare("
		//     UPDATE `$dbTableName` 
		//     SET pending_actions = JSON_SET(IFNULL(pending_actions, '{}'), '$.\"$playerId\"', ?), turn = ? 
		//     WHERE id = ? AND step = ?
		// ");
		$stmt = $conn->prepare("
        UPDATE `$dbTableName` 
        SET pending_actions = JSON_SET(pending_actions, '$.\"$playerId\"', ?), turn = ? 
        WHERE id = ? AND step = ?
    ");

		// Bind parameters: action (string), id (int), step (int)
		$stmt->bind_param("ssii", $actionJson, $turn, $id, $clientStep);
		$stmt->execute();

		// 2. CHECK FOR CONFLICT: If affected_rows is 0, the step changed or the row was missing.
		if ($conn->affected_rows === 0) {
			// Fetch current row to help the client sync
			$stmtSync = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
			$stmtSync->bind_param("i", $id);
			$stmtSync->execute();
			$syncRow = decodeJsonColumns($stmtSync->get_result()->fetch_assoc());

			send([
				'error' => 'Step mismatch',
				'message' => 'The round has already advanced or your data is stale.',
				'row' => $syncRow
			], 200);
		}

		// 3. FETCH & RETURN: Send back the full row so the client can count the moves.
		$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
		$stmt2->bind_param("i", $id);
		$stmt2->execute();
		$updatedRow = $stmt2->get_result()->fetch_assoc();

		if ($updatedRow) {
			$updatedRow = decodeJsonColumns($updatedRow);
		}

		send(['success' => true, 'status' => 'ok', 'row' => $updatedRow]);
		break;
	case 'update_row_all':
		$tableId = (int) $input['id'];
		$playerId = $input['player_id'];
		$action = json_encode($input['action']);
		$clientStep = (int) $input['step'];

		// 1. Record the individual player's move
		// We use WHERE game_id AND player_id to target exactly one person
		$stmt = $conn->prepare("
        UPDATE `game_sync` 
        SET has_moved = 1, move_data = ? 
        WHERE game_id = ? AND player_id = ?
    ");
		$stmt->bind_param("sis", $action, $tableId, $playerId);
		$stmt->execute();

		// 2. Count how many players are done for this game
		$countStmt = $conn->prepare("SELECT COUNT(*) as done FROM `game_sync` WHERE game_id = ? AND has_moved = 1");
		$countStmt->bind_param("i", $tableId);
		$countStmt->execute();
		$doneCount = $countStmt->get_result()->fetch_assoc()['done'];

		// 3. Fetch total players from the main table
		$totalStmt = $conn->prepare("SELECT players FROM `gametable` WHERE id = ?");
		$totalStmt->bind_param("i", $tableId);
		$totalStmt->execute();
		$playersList = json_decode($totalStmt->get_result()->fetch_assoc()['players'], true);
		$totalCount = count($playersList);

		// 4. Return the status
		if ($doneCount >= $totalCount) {
			// Collect all moves to send back to the Architect
			$allMovesStmt = $conn->prepare("SELECT player_id, move_data FROM `game_sync` WHERE game_id = ?");
			$allMovesStmt->bind_param("i", $tableId);
			$allMovesStmt->execute();
			$rows = $allMovesStmt->get_result()->fetch_all(MYSQLI_ASSOC);

			// Format as a dictionary for JS
			$moves = [];
			foreach ($rows as $r) {
				$moves[$r['player_id']] = json_decode($r['move_data'], true);
			}

			send(['status' => 'completed', 'moves' => $moves]);
		} else {
			send(['status' => 'waiting', 'count' => $doneCount]);
		}
		break;
	case 'update_row_group':
		$tableId = (int) $input['id'];
		$playerId = $input['player_id'];
		$action = json_encode($input['data']['action']);
		$clientStep = (int) $input['data']['step'];

		// 1. Record the individual player's move
		// We use WHERE game_id AND player_id to target exactly one person
		$stmt = $conn->prepare("
        UPDATE `game_sync` 
        SET has_moved = 1, move_data = ? 
        WHERE game_id = ? AND player_id = ?
    ");
		$stmt->bind_param("sis", $action, $tableId, $playerId);
		$stmt->execute();

		// 2. Count how many players are done for this game
		$countStmt = $conn->prepare("SELECT COUNT(*) as done FROM `game_sync` WHERE game_id = ? AND has_moved = 1");
		$countStmt->bind_param("i", $tableId);
		$countStmt->execute();
		$doneCount = $countStmt->get_result()->fetch_assoc()['done'];

		// 3. Fetch total players from the main table
		$totalStmt = $conn->prepare("SELECT players FROM `gametable` WHERE id = ?");
		$totalStmt->bind_param("i", $tableId);
		$totalStmt->execute();
		$playersList = json_decode($totalStmt->get_result()->fetch_assoc()['players'], true);
		$totalCount = count($playersList);

		// 4. Return the status
		if ($doneCount >= $totalCount) {
			// Collect all moves to send back to the Architect
			$allMovesStmt = $conn->prepare("SELECT player_id, move_data FROM `game_sync` WHERE game_id = ?");
			$allMovesStmt->bind_param("i", $tableId);
			$allMovesStmt->execute();
			$rows = $allMovesStmt->get_result()->fetch_all(MYSQLI_ASSOC);

			// Format as a dictionary for JS
			$moves = [];
			foreach ($rows as $r) {
				$moves[$r['player_id']] = json_decode($r['move_data'], true);
			}

			send(['status' => 'completed', 'moves' => $moves]);
		} else {
			send(['status' => 'waiting', 'count' => $doneCount]);
		}
		break;
	case '_update_game_sync':
		$id = (int) $input['id'];
		$playerId = $input['player_id'];
		$moveData = json_encode($input['action']);
		$clientStep = (int) $input['step'];

		// 1. Update the player's status in the sync table
		$stmt = $conn->prepare("REPLACE INTO game_sync (game_id, player_id, has_moved, move_data) VALUES (?, ?, 1, ?)");
		$stmt->bind_param("iss", $id, $playerId, $moveData);
		$stmt->execute();

		// 2. Check if everyone is done
		$res = $conn->query("SELECT players FROM gametable WHERE id = $id");
		$players = json_decode($res->fetch_assoc()['players'], true);
		$totalNeeded = count($players);

		$res = $conn->query("SELECT COUNT(*) as cnt FROM game_sync WHERE game_id = $id AND has_moved = 1");
		$doneCount = $res->fetch_assoc()['cnt'];

		if ($doneCount >= $totalNeeded) {
			// Collect all moves for the Architect
			$res = $conn->query("SELECT player_id, move_data FROM game_sync WHERE game_id = $id");
			$moves = [];
			while ($r = $res->fetch_assoc()) {
				$moves[$r['player_id']] = json_decode($r['move_data'], true);
			}
			send(['status' => 'completed', 'moves' => $moves]);
		} else {
			send(['status' => 'waiting', 'count' => $doneCount]);
		}
		break;

	case 'update_game_sync':
		$id = (int) $input['id'];
		$playerId = $input['player_id'];
		$moveData = json_encode($input['action']);
		$clientStep = (int) $input['step'];

		// 1. Update the player's status in the sync table
		$stmt = $conn->prepare("REPLACE INTO game_sync (game_id, player_id, has_moved, move_data) VALUES (?, ?, 1, ?)");
		$stmt->bind_param("iss", $id, $playerId, $moveData);
		$stmt->execute();

		// 2. Check if everyone is done
		$res = $conn->query("SELECT turn FROM gametable WHERE id = $id");
		$row = $res->fetch_assoc();
		$turnList = json_decode($row['turn'] ?? '[]', true);
		$totalNeeded = count($turnList);

		$res = $conn->query("SELECT COUNT(*) as cnt FROM game_sync WHERE game_id = $id AND has_moved = 1");
		$doneCount = $res->fetch_assoc()['cnt'];

		if ($doneCount >= $totalNeeded) {
			// Collect all moves for the Architect
			$res = $conn->query("SELECT player_id, move_data FROM game_sync WHERE game_id = $id");
			$moves = [];
			while ($r = $res->fetch_assoc()) {
				$moves[$r['player_id']] = json_decode($r['move_data'], true);
			}
			send(['status' => 'completed', 'moves' => $moves]);
		} else {
			send(['status' => 'waiting', 'count' => $doneCount]);
		}
		break;

	case '_finalize_round':
		$id = (int) $input['id'];
		$data = $input['data'];
		$oldStep = (int) $data['step'] - 1; // We assume Architect already incremented it

		// 1. Update the main table with the new FEN, Scores, and Step
		// (Reuse your existing update logic here or a simplified version)
		$dataJson = json_encode($data);
		// ... insert your standard 'update_row' logic here to save $data to 'gametable' ...

		// 2. CRITICAL: Clear the sync table for the next round
		$conn->query("DELETE FROM game_sync WHERE game_id = $id");

		send(['success' => true]);
		break;
	case 'finalize_round':
		$id = (int) $input['id'];
		$data = $input['data']; // This is the full 'table' object from JS
		$oldStep = (int) $data['step'] - 1;

		// 1. Prepare the data for SQL
		// We only want to update columns that actually exist in your 'gametable'
		$allowedColumns = ['action', 'expected', 'fen', 'friendly', 'game', 'modified', 'notes', 'oldfen', 'options', 'owner', 'phase', 'players', 'plorder', 'round', 'stage', 'status', 'step', 'turn', 'pending', 'last_round_results'];
		$updateParts = [];
		$types = "";
		$values = [];

		foreach ($data as $key => $value) {
			if (in_array($key, $allowedColumns)) {
				$updateParts[] = "`$key` = ?";
				// If the value is an array or object, stringify it for the DB
				if (is_array($value)) {
					$values[] = json_encode($value);
					$types .= "s";
				} else {
					$values[] = $value;
					$types .= is_int($value) ? "i" : "s";
				}
			}
		}

		if (!empty($updateParts)) {
			$sql = "UPDATE `gametable` SET " . implode(', ', $updateParts) . " WHERE id = ?";
			$stmt = $conn->prepare($sql);

			// Add the ID and OldStep to the end for the WHERE clause
			$types .= "i";
			$values[] = $id;
			//$values[] = $oldStep;

			$stmt->bind_param($types, ...$values);
			$stmt->execute();

			// Check if the update actually happened (prevents double-finalization)
			if ($stmt->affected_rows === 0) {
				send(['error' => 'Finalization failed: Step mismatch or already finalized'], 409);
			}
		}

		// 2. CRITICAL: Clear the sync table for the next round
		// Only happens if the main table update was successful
		$stmtSync = $conn->prepare("DELETE FROM game_sync WHERE game_id = ?");
		$stmtSync->bind_param("i", $id);
		$stmtSync->execute();

		send(['success' => true, 'newStep' => $data['step']]);
		break;
	case 'modify_row_fo':
	case 'update_row_fo':
		if (!$dbTableName || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];

		//get existing table from db
		$stmt = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$row = $stmt->get_result()->fetch_assoc();
		//if step in existing table == $data["step"] then update
		if ($row['step'] == $data['step']) {
			//increment $data['step']
			$data['step'] = $row['step'] + 1;


			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data); // <-- fix
			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
			$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ?");
			$types = str_repeat("s", count($data)) . "i";
			$values = array_merge(array_values($data), [$id]);
			$stmt->bind_param($types, ...$values);
			$ok = $stmt->execute();

			// fetch the updated row to send back
			$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			$row = $stmt2->get_result()->fetch_assoc();
			if ($row && $dbTableName === 'gametable')
				$row = decodeJsonColumns($row); // decode JSON columns if gametable
			send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		} else {
			if ($row && $dbTableName === 'gametable')
				$row = decodeJsonColumns($row); // decode JSON columns if gametable
			send(['success' => False, 'message' => 'too late!', 'row' => $row]);
		}
		break;
	case 'modify_row_fs':
		send(['msg' => 'hallo'], 200);
		die;
		break;
	case '_update_row_fs':
		if (!$dbTableName || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);
		$data = $input['data'];
		$success = $data['action']['success'];

		//get existing table from db
		$stmt = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
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
			$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ?");
			$types = str_repeat("s", count($data)) . "i";
			$values = array_merge(array_values($data), [$id]);
			$stmt->bind_param($types, ...$values);
			$ok = $stmt->execute();

			// fetch the updated row to send back
			$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			$row = $stmt2->get_result()->fetch_assoc();
			$row = decodeJsonColumns($row);
			send(['success' => $ok, 'affected_rows' => $conn->affected_rows, 'row' => $row]);
		} else {
			$row = decodeJsonColumns($row);
			send(['success' => False, 'message' => 'too late!', 'row' => $row]);
		}
		break;

	case 'update_row_fs':
		if (!$dbTableName || !$id || empty($input['data']))
			send(['error' => 'Missing table, id or data'], 400);

		$data = $input['data'];
		$clientStep = (int) $data['step'];
		$isMoveSuccessful = $data['action']['success'] ?? false;

		if ($isMoveSuccessful) {
			// ATOMIC UPDATE: Only update if the DB step still matches the client step
			$data['step'] = $clientStep + 1;
			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data);

			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
			$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ? AND step = ?");

			$types = str_repeat("s", count($data)) . "ii";
			$values = array_merge(array_values($data), [$id, $clientStep]);
			$stmt->bind_param($types, ...$values); // Note: bind_param was missing here in your snippet
			$stmt->execute();

			if ($conn->affected_rows > 0) {
				// Success!
				$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
				$stmt2->bind_param("i", $id);
				$stmt2->execute();
				$row = decodeJsonColumns($stmt2->get_result()->fetch_assoc());
				send(['success' => true, 'row' => $row]);
			} else {
				// Conflict
				$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
				$stmt2->bind_param("i", $id);
				$stmt2->execute();
				$row = decodeJsonColumns($stmt2->get_result()->fetch_assoc());
				send(['success' => false, 'message' => 'Conflict: Step already advanced', 'row' => $row]);
			}
		} else {
			// Move failed: Save the state (score deduction) without incrementing step
			$data = array_map(fn($v) => is_array($v) ? json_encode($v) : $v, $data);
			$set = implode(", ", array_map(fn($k) => "`$k` = ?", array_keys($data)));
			$stmt = $conn->prepare("UPDATE `$dbTableName` SET $set WHERE id = ?");

			// FIXED: Added types and values mapping
			$types = str_repeat("s", count($data)) . "i";
			$values = array_merge(array_values($data), [$id]);
			$stmt->bind_param($types, ...$values);

			$stmt->execute();

			// Fetch latest state to ensure frontend has current scores
			$stmt2 = $conn->prepare("SELECT * FROM `$dbTableName` WHERE id = ?");
			$stmt2->bind_param("i", $id);
			$stmt2->execute();
			$row = decodeJsonColumns($stmt2->get_result()->fetch_assoc());

			send(['success' => true, 'message' => 'Update saved (step unchanged)', 'row' => $row]);
		}
		break;
	case 'delete_row':
		if (!$dbTableName || !$id)
			send(['error' => 'Missing table or id'], 400);
		$stmt = $conn->prepare("DELETE FROM `$dbTableName` WHERE id = ?");
		$stmt->bind_param("i", $id);
		$ok = $stmt->execute();
		send(['success' => $ok, 'deleted_id' => $id]);
		break;
	case 'delete_finished':
		if (!$dbTableName)
			send(['error' => 'Missing db table'], 400);
		$stmt = $conn->prepare("DELETE FROM `$dbTableName` WHERE status = 'over'");
		$ok = $stmt->execute();
		send(['success' => $ok, 'deleted' => 'finished games']);
		break;
	case 'delete_all':
		if (!$dbTableName)
			send(['error' => 'Missing db table'], 400);
		$stmt = $conn->prepare("DELETE FROM `$dbTableName`");
		$ok = $stmt->execute();
		send(['success' => $ok, 'deleted' => 'finished games']);
		break;


	default:
		send(['error' => "Unknown cmd: $cmd"], 400);
}

$conn->close();
?>