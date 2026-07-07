<?php
// 1. Set the destination directory
define('YDIR', dirname(__DIR__, 2) . '/y/');
$targetDir = YDIR	. 'images/';

// Create the directory if it doesn't exist
if (!file_exists($targetDir)) {
	mkdir($targetDir, 0777, true);
}

// 2. Check if the file was actually sent
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
	$file = $_FILES['image'];

	// Check for PHP upload errors
	if ($file['error'] !== UPLOAD_ERR_OK) {
		http_response_code(400);
		echo json_encode(["error" => "Upload failed with error code " . $file['error']]);
		exit;
	}

	// 3. Security: Validate that it is an image
	$check = getimagesize($file['tmp_name']);
	if ($check === false) {
		http_response_code(400);
		echo json_encode(["error" => "File is not a valid image."]);
		exit;
	}

	// 4. Generate a unique filename to prevent overwriting
	$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
	$fileName = uniqid('img_', true) . '.png'; // Since we sent it as PNG from JS
	$targetFilePath = $targetDir . $fileName;

	// 5. Move the file from temp storage to destination
	if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
		http_response_code(200);
		echo json_encode([
			"message" => "Image uploaded successfully",
			"url" => $targetFilePath,
			"filename" => $fileName
		]);
	} else {
		http_response_code(500);
		echo json_encode(["error" => "Failed to move uploaded file."]);
	}
} else {
	http_response_code(405);
	echo json_encode(["error" => "Invalid request method."]);
}
?>