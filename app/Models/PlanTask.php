<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanTask extends Model
{
    protected $fillable = [
        'plan_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'status'
    ];

    /**
     * Une tâche appartient à un plan.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}