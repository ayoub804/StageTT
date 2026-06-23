<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Models\Notification;

class TaskController extends Controller
{
    /**
     * 📋 Liste des tâches
     */
    public function index()
    {
        $user = auth()->user();
        if ($user->role === 'student') {
            $student = $user->student;
            if (!$student) return [];
            $internship = $student->internships()->first();
            if (!$internship) return [];
            return Task::where('internship_id', $internship->id)->get();
        } elseif ($user->role === 'supervisor') {
            $supervisor = $user->supervisor;
            if (!$supervisor) return [];
            $internshipIds = $supervisor->internships()->pluck('id');
            return Task::whereIn('internship_id', $internshipIds)->get();
        } else {
            return Task::all();
        }
    }

    /**
     * ➕ Créer une tâche
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        $internshipId = $request->internship_id;

        if ($user->role === 'student') {
            $student = $user->student;
            $internship = $student ? $student->internships()->first() : null;
            if ($internship) {
                $internshipId = $internship->id;
            }
        }

        if (!$internshipId) {
            return response()->json(['message' => 'Aucun stage associé trouvé.'], 422);
        }

        $request->merge(['internship_id' => $internshipId]);

        $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'priority' => 'nullable|string',
            'deadline' => 'nullable|date',
        ]);

        $task = Task::create([
            'internship_id' => $internshipId,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'À faire',
            'priority' => $request->priority ?? 'Moyenne',
            'deadline' => $request->deadline,
        ]);

        return response()->json($task);
    }

    /**
     * 👁️ Voir une tâche
     */
    public function show(string $id)
    {
        return Task::findOrFail($id);
    }

    /**
     * ✏️ Modifier une tâche
     */
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        $task->update($request->only([
            'title',
            'description',
            'status',
            'priority',
            'deadline'
        ]));

        return response()->json($task);
    }

    /**
     * 🗑️ Supprimer une tâche
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Tâche supprimée'
        ]);
    }

    /**
     * 🔥 KANBAN - changer statut (drag & drop)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:À faire,En cours,Terminé'
        ]);

        $task = Task::findOrFail($id);

        $task->update([
            'status' => $request->status
        ]);

        // 🔔 NOTIFICATION AUTOMATIQUE
        Notification::create([
            'user_id' => $task->internship->student->user_id,
            'title' => 'Tâche mise à jour',
            'message' => 'Une tâche a changé de statut',
            'type' => 'task',
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Statut mis à jour + notification envoyée',
            'task' => $task
        ]);
    }
}