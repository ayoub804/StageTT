<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
| Autorisation des canaux temps réel (Reverb / WebSockets)
*/

Broadcast::channel('conversation.{id}', function ($user, $id) {
    // PFA simple : accès autorisé
    // (tu peux sécuriser plus tard avec sender/receiver)
    return true;
});