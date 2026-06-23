<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'internship_id',
        'generated_by_ai'
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }

    public function planTasks()
    {
        return $this->hasMany(PlanTask::class);
    }

    public function tasks()
    {
        return $this->hasMany(PlanTask::class);
    }
}