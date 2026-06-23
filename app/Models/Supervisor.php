<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\Department;
use App\Models\Topic;
use App\Models\Internship;

class Supervisor extends Model
{
    protected $fillable = [
        'user_id',
        'department_id',
        'poste',
        'specialty'
    ];

    /**
     * Lien avec user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Un supervisor appartient à un département
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Un encadrant propose plusieurs sujets
     */
    public function topics()
    {
        return $this->hasMany(Topic::class);
    }

    /**
     * Un encadrant supervise plusieurs stages
     */
    public function internships()
    {
        return $this->hasMany(Internship::class);
    }
}