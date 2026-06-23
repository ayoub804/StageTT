<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = [
        'nom',
        'description'
    ];

    public function supervisors()
    {
        return $this->hasMany(Supervisor::class);
    }

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }
}