<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Student;
use App\Models\Supervisor;
use App\Models\Topic;
use App\Models\Department;
use App\Models\Task;
use App\Models\Deliverable;
use App\Models\Plan;

class Internship extends Model
{
    protected $fillable = [
        'student_id',
        'supervisor_id',
        'topic_id',
        'department_id',
        'date_debut',
        'date_fin',
        'status',
        'progress_percentage'
    ];

    /**
     * Stage appartient à un student
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Stage appartient à un encadrant
     */
    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class);
    }

    /**
     * Stage lié à un sujet
     */
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * Stage appartient à un département
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Un stage contient plusieurs tâches
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Un stage contient plusieurs livrables
     */
    public function deliverables()
    {
        return $this->hasMany(Deliverable::class);
    }

    /**
     * Un stage a un planning IA
     */
    public function plan()
    {
        return $this->hasOne(Plan::class);
    }
} 