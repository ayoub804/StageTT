<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Supervisor;
use App\Models\Internship;
use App\Models\Topic;
use App\Models\Task;
use App\Models\Deliverable;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Dashboard principal
     */
    public function index()
    {
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */
        if ($user->role === 'admin') {

            return response()->json([

                'users' => User::count(),
                'students' => Student::count(),
                'supervisors' => Supervisor::count(),
                'internships' => Internship::count(),
                'topics' => Topic::count(),

                'kanban' => [
                    'todo' => Task::where('status', 'À faire')->count(),
                    'doing' => Task::where('status', 'En cours')->count(),
                    'done' => Task::where('status', 'Terminé')->count(),
                ]
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | SUPERVISOR
        |--------------------------------------------------------------------------
        */
        if ($user->role === 'supervisor') {

            if (!$user->supervisor) {
                return response()->json([
                    'message' => 'Supervisor introuvable'
                ], 404);
            }

            $supervisorId = $user->supervisor->id;

            return response()->json([

                'topics' => Topic::where('supervisor_id', $supervisorId)->count(),

                'internships' => Internship::where(
                    'supervisor_id',
                    $supervisorId
                )->count(),

                'students_assigned' => Internship::where(
                    'supervisor_id',
                    $supervisorId
                )->distinct('student_id')
                    ->count('student_id'),

                'tasks' => Task::whereHas(
                    'internship',
                    fn($q) => $q->where('supervisor_id', $supervisorId)
                )->count(),

                'kanban' => [

                    'todo' => Task::whereHas(
                        'internship',
                        fn($q) => $q->where('supervisor_id', $supervisorId)
                    )->where('status', 'À faire')->count(),

                    'doing' => Task::whereHas(
                        'internship',
                        fn($q) => $q->where('supervisor_id', $supervisorId)
                    )->where('status', 'En cours')->count(),

                    'done' => Task::whereHas(
                        'internship',
                        fn($q) => $q->where('supervisor_id', $supervisorId)
                    )->where('status', 'Terminé')->count(),
                ],

                'active_internships' => Internship::with(['student.user', 'topic'])
                    ->where('supervisor_id', $supervisorId)
                    ->get()
                    ->map(function ($internship) {
                        return [
                            'student_name' => $internship->student->user->name ?? 'Inconnu',
                            'topic_title' => $internship->topic->title ?? 'Sujet non défini',
                            'progress' => $internship->progress_percentage ?? 0,
                            'last_deliverable' => Deliverable::where('internship_id', $internship->id)->latest()->first()->type ?? 'Aucun',
                        ];
                    }),

                'recent_deliverables' => Deliverable::with(['internship.student.user'])
                    ->whereHas('internship', fn($q) => $q->where('supervisor_id', $supervisorId))
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($d) {
                        return [
                            'student_name' => $d->internship->student->user->name ?? 'Inconnu',
                            'type' => $d->type,
                            'date' => $d->created_at->format('d/m/Y'),
                        ];
                    }),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | STUDENT
        |--------------------------------------------------------------------------
        */
        if ($user->role === 'student') {

            if (!$user->student) {
                return response()->json([
                    'message' => 'Stagiaire introuvable'
                ], 404);
            }

            $studentId = $user->student->id;

            $internship = Internship::with(['supervisor.user', 'topic'])->where(
                'student_id',
                $studentId
            )->first();

            return response()->json([

                'internship' => $internship,

                'progress' => $internship?->progress_percentage ?? 0,

                'tasks_total' => Task::whereHas(
                    'internship',
                    fn($q) => $q->where('student_id', $studentId)
                )->count(),

                'tasks_done' => Task::whereHas(
                    'internship',
                    fn($q) => $q->where('student_id', $studentId)
                )->where('status', 'Terminé')->count(),

                'tasks_doing' => Task::whereHas(
                    'internship',
                    fn($q) => $q->where('student_id', $studentId)
                )->where('status', 'En cours')->count(),

                'tasks_todo' => Task::whereHas(
                    'internship',
                    fn($q) => $q->where('student_id', $studentId)
                )->where('status', 'À faire')->count(),

                'deliverables' => Deliverable::whereHas(
                    'internship',
                    fn($q) => $q->where('student_id', $studentId)
                )->count()
            ]);
        }

        return response()->json([
            'message' => 'Rôle non reconnu'
        ], 403);
    }
}