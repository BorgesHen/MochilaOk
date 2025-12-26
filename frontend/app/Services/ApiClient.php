<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ApiClient
{
    public static function base()
    {
        return Http::baseUrl(config('services.api.base_url'))
            ->acceptJson()
            ->timeout(15);
    }

    public static function authed(Request $request)
    {
        $token = $request->session()->get('api_token');
        return self::base()->withToken($token);
    }
}
