<?php

// TODO report errors to user
// TODO same date with multiple entries?

$filename   = 'prac_data_110515.dat';
$types      = 4;


// Parse shit
$contents = file_get_contents($filename);

$lines = preg_split('/(\r\n)|(\n)/', $contents, -1, PREG_SPLIT_NO_EMPTY);

// Data Structures for JS
$totals = array();
$practices = array_fill(0, $types, array());
$descriptions = array();

foreach ($lines as $line) {

    $line = explode('#', $line);

    $practice = $line[0];
    $description = (isset($line[1]) ? $line[1] : '');

    if (!$practice) continue;

    $times = preg_split('/\s+/', $practice, -1, PREG_SPLIT_NO_EMPTY);

    if (count($times) != $types+1) continue;

    $descriptions[] = $description;

    $total = 0;
    for ($i = 0; $i < $types; $i++) {
        $total += $times[$i+1];
        $practices[$i][] = $times[$i+1];
    }

    $totals[] = $total;
}

print_r($totals);
print_r($descriptions);
print_r($practices);

?>
