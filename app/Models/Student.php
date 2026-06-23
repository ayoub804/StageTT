<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\Internship;

class Student extends Model
{
    protected $fillable = [
        'user_id',
        'specialite',
        'specialty',
        'niveau',
        'university',
        'competences',
        'cv_path'
    ];

    /**
     * Un student appartient à un user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Un student peut avoir plusieurs stages
     */
    public function internships()
    {
        return $this->hasMany(Internship::class);
    }

    /**
     * Un student a un stage principal/actif
     */
    public function internship()
    {
        return $this->hasOne(Internship::class);
    }
}