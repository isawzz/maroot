<?php
require __DIR__ . '/../../../vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;

// --- HTTP headers ---
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// --- Directory constants ---
define('YDIR', dirname(__DIR__, 2) . '/y/');
define('GAME_DIR', YDIR . 'tables/');
define('USERS_READ', YDIR . 'users.yaml');
define('CONFIG_READ', YDIR . 'config.yaml');
define('ASSETS', dirname(__DIR__, 2) . '/');

if (!is_dir(GAME_DIR))
    mkdir(GAME_DIR, 0777, true);

// #region YAML & JSON utilities

function arrayToYamlFile(array $data, string $file)
{
    $ydata = Yaml::dump(
        $data,
        4,
        2,
        Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
    );
    file_put_contents($file, $ydata);
}

function yamlFileToArray(string $file)
{
    return Yaml::parse(file_get_contents($file));
}

function a2y($data)
{
    return Yaml::dump(
        $data,
        4,
        2,
        Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
    );
}

function y2a($contents)
{
    return Yaml::parse($contents) ?: [];
}

function arrayToYaml(array $array)
{
    return Yaml::dump(
        $array,
        4,
        2,
        Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK | Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
    );
}

function yamlToJson(string $yaml): string
{
    return json_encode(Yaml::parse($yaml), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}

function yamlFileToJson(string $file)
{
    return yamlToJson(file_get_contents($file));
}

function jsonToYaml(string $json): string
{
    $data = json_decode($json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new InvalidArgumentException("Invalid JSON: " . json_last_error_msg());
    }
    return arrayToYaml($data);
}

function jsonFileToArray(string $file)
{
    return json_decode(file_get_contents($file), true);
}

// #endregion

// #region Object <-> Array <-> JSON <-> YAML conversions

function arrayToObject(array $array)
{
    return json_decode(json_encode($array));
}

function objectToArray($object)
{
    return json_decode(json_encode($object), true);
}

function objectToJson($object)
{
    return json_encode(objectToArray($object), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}

function objectToYaml($object)
{
    return arrayToYaml(objectToArray($object));
}

// #endregion

// #region General utilities

function startsWith($haystack, $needle)
{
    return str_starts_with($haystack, $needle);
}

function randomColor()
{
    return sprintf("#%06X", mt_rand(0, 0xFFFFFF));
}

class UserData
{
    public $color;
    public $name;
    public $imgkey;

    public function __construct($name)
    {
        $this->color = randomColor();
        $this->name = $name;
        $this->imgkey = 'unknown_user';
    }
}

// #endregion

// #region Database helpers with YAML config

function dbConnect()
{
    static $conn = null;
    if ($conn && $conn->ping())
        return $conn;

    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    // return $host;

    // Hardcoded config depending on host
    if (str_contains($host, 'moxito')) { //in_array($host, ['localhost', '127.0.0.1'])) {
        // Remote FastComet settings
        $dbHost = 'localhost';
        $dbName = 'moxitoon_gamedb';
        $dbUser = 'moxitoon_tawzz';
        $dbPass = 'mptspw4moxito';
    } else {
        // Localhost settings
        $dbHost = 'localhost';
        $dbName = 'gamedb';
        $dbUser = 'root';
        $dbPass = '';
    }

    $conn = new mysqli(
        $dbHost,
        $dbUser,
        $dbPass,
        $dbName
    );
    return $conn;

}

function dbQuery($conn, $sql, $params = [], $types = "")
{
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return ["error" => $conn->error];
    }

    if ($params) {
        if ($types === "")
            $types = str_repeat("s", count($params));
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result) {
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    } else {
        $stmt->close();
        return ["success" => true];
    }
}

function dbGetAllTables($conn)
{
    $res = $conn->query("SHOW TABLES");
    $tables = [];
    while ($row = $res->fetch_array()) {
        $tables[] = $row[0];
    }
    return $tables;
}

function dbGetTable($conn, $table)
{
    return dbQuery($conn, "SELECT * FROM `$table`");
}

function dbCreateTable($conn, $table, $columns)
{
    $defs = [];
    foreach ($columns as $col => $type) {
        $defs[] = "`$col` $type";
    }
    $sql = "CREATE TABLE `$table` (" . implode(", ", $defs) . ")";
    return $conn->query($sql) ? ["success" => true] : ["error" => $conn->error];
}

function dbDeleteTable($conn, $table)
{
    return $conn->query("DROP TABLE IF EXISTS `$table`")
        ? ["success" => true] : ["error" => $conn->error];
}

function dbModifyTable($conn, $table, $alterSQL)
{
    return $conn->query("ALTER TABLE `$table` $alterSQL")
        ? ["success" => true] : ["error" => $conn->error];
}

// #endregion
?>