<?php
header('Content-Type: text/plain');
echo "Current Directory: " . __DIR__ . "\n";
$target = __DIR__ . '/../../../vendor/autoload.php';
echo "Looking for autoload at: " . realpath($target) . "\n";
if (file_exists($target)) {
    echo "✅ Found it!";
} else {
    echo "❌ NOT FOUND. You need to upload the vendor folder.";
}