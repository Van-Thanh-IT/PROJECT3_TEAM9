<?php

return [

    'paths' => [
        'api/*',
        'broadcasting/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['*'],

    'max_age' => 0,

    // JWT không dùng cookies, nên để false
    'supports_credentials' => false,
];
