<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'internship_id',
        'title',
        'description',
        'status',
        'priority',
        'deadline'
    ];

    /**
     * Une tâche appartient à un stage.
     */
    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}