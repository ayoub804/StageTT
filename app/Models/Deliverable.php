<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deliverable extends Model
{
    protected $fillable = [
        'internship_id',
        'title',
        'type',
        'file_path',
        'status',
        'feedback'
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}