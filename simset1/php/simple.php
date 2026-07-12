<?php
header('Content-Type: application/json');
echo json_encode([
    "status" => "success",
    "message" => "PHP is working on Telecave!",
    "server_time" => date('Y-m-d H:i:s')
]);
exit;