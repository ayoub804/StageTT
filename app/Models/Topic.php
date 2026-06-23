<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    protected $fillable = [
        'supervisor_id',
        'title',
        'description',
        'technologies',
        'duree',
        'status'
    ];

    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function internship()
    {
        return $this->hasOne(Internship::class);
    }
}