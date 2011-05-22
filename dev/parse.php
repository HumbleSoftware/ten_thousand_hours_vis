<?php

// TODO report errors to user
// TODO same date with multiple entries?

$filename   = 'prac_data_110515.dat';
$types      = 4;


// Parse shit
$contents = file_get_contents($filename);

$lines = preg_split('/(\r\n)|(\n)/', $contents, -1, PREG_SPLIT_NO_EMPTY);

// Data Structures for JS
$totals         = array();
$practices      = array_fill(0, $types, array());
$descriptions   = array();
$dates          = array();

$count = 0;
$cummulative = 0;
foreach ($lines as $line) {

    $line           = explode('#', $line);
    $practice       = $line[0];
    $description    = (isset($line[1]) ? $line[1] : '');

    if (!$practice) continue;

    $times = preg_split('/\s+/', $practice, -1, PREG_SPLIT_NO_EMPTY);

    if (count($times) != $types+1) continue;

    $descriptions[] = trim($description);

    $date = DateTime::createFromFormat('ymd', $times[0]);
    $dates[] = $date->format('n/j/Y');

    $total = 0;
    for ($i = 0; $i < $types; $i++) {
        $total += (float) $times[$i+1];
        $practices[$i][] = array($count, (float) $times[$i+1]);
    }

    $cummulative += $total;
    $totals[] = array($count, $cummulative);

    $count++;
}

//print_r($totals);
//print_r($descriptions);
//print_r($practices);

echo 'var totals = ';
print_r(json_encode($totals));
echo ';';
echo "\n";
echo 'var descriptions = ';
print_r(json_encode($descriptions));
echo ';';
echo "\n";

/*
Personal Practice,
Onensamble Practice,
Group Time Practice,
Live / Performance Practice
*/         

echo 'var practices = [';
echo '{"label":"Personal Practice","data":'.json_encode($practices[0]).'},';
echo '{"label":"Onensamble Practice","data":'.json_encode($practices[1]).'},';
echo '{"label":"Group Practice","data":'.json_encode($practices[2]).'},';
echo '{"label":"Live Performance","data":'.json_encode($practices[3]).'}';
echo '];';

echo 'var dates = ';
print_r(json_encode($dates));
echo ';';












?>
