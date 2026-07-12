<?php
define('YDIR', dirname(__DIR__, 2) . '/y/');
define('BASEDIR', dirname(__DIR__, 2) . '/');
$targetDir = YDIR . 'images/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    // Sanitize the filename provided by the user
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['filename'] ?? 'image');
    $extension = ".jpg";

    // Logic for auto-indexing
    $finalName = $baseName . $extension;
    $counter = 1;

    if (isset($_POST['dirname'])) {
        $targetDir = BASEDIR . $_POST['dirname'] . '/';
        //echo json_encode(["dirname" => $targetDir]); die;
    }

    // Loop until we find a filename that doesn't exist
    $savetype = $_POST['savetype'];
    if ($savetype != 'override') {
        while (file_exists($targetDir . $finalName)) {
            $finalName = $baseName . "(" . $counter . ")" . $extension;
            $counter++;
        }
    }

    $targetFilePath = $targetDir . $finalName;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
        echo json_encode([
            "status" => "success",
            "filename" => $finalName,
            "path" => $targetFilePath
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Move failed"]);
    }
}
?>