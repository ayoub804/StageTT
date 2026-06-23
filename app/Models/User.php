<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use App\Models\Student;
use App\Models\Supervisor;
use App\Models\Message;
use App\Models\Notification;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Champs autorisés en mass assignment
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * Champs cachés
     */
    protected $hidden = [
        'password',
        'remember_token'
    ];

    /**
     * Casts automatiques
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Un utilisateur peut être un étudiant
     */
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Un utilisateur peut être un encadrant
     */
    public function supervisor()
    {
        return $this->hasOne(Supervisor::class);
    }

    /**
     * Messages envoyés par l'utilisateur
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Notifications de l'utilisateur
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Conversations de l'utilisateur
     */
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)->withTimestamps();
    }
}