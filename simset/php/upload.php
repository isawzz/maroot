<?php
include 'helpers.php';

if (isset($_POST['imageData']) && isset($_POST['filename'])) {
    $imageData = $_POST['imageData'];
    $filename = $_POST['filename'];

    // Remove the prefix from the image data
    $base64Data = str_replace('data:image/png;base64,', '', $imageData);
    $image = base64_decode($base64Data);

    // Save the image to a file
    $path = YDIR . $filename;  // Ensure you have a folder named 'uploads' and it's writable
    file_put_contents($path, $image);

    echo 'Image uploaded successfully!';
} else {
    echo 'Error uploading image.';
}
?>
