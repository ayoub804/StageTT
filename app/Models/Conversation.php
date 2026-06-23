<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'topic_id',
        'type'
    ];

    /**
     * Une conversation appartient à un topic
     */
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * Une conversation contient plusieurs messages
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Une conversation a plusieurs utilisateurs
     */
    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }
}