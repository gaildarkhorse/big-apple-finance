<?php

    $IP_ADDR = "localhost";
    if ($_SERVER['REMOTE_ADDR'] == '::1' || $_SERVER['REMOTE_ADDR'] == '127.0.0.1' || $_SERVER['REMOTE_ADDR'] == 'localhost') {
    } else {
        $IP_ADDR = $_SERVER['REMOTE_ADDR'];
    }

    $is_go = true;

    foreach (getallheaders() as $name => $value) {   
        if (strtoupper($name) == strtoupper("Content-Length")) {
            $is_go = false;
        }
        if (strtoupper($name) == strtoupper("Transfer-Encoding")) {
            $is_go = false;
        }
        if (strtoupper($name) == strtoupper("Content-Transfer-Encoding")) {
            $is_go = false;
        }
    }    

    if ($is_go) {
        require('index.html');
    } else {
        echo "<html><body><h1>Bad Request!</h1></body></html>";
    }

?>