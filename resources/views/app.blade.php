<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>{{ config('app.name') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/png" href="{{ asset('icon.png') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/main.css') }}" />
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
    @laravelPWA
</head>
  <body>
    @inertia
  </body>
</html>
