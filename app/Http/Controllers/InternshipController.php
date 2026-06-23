<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use App\Models\Student;
use App\Models\Supervisor;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    /**
     * LIST ALL INTERNSHIPS
     */
    public function index()
    {
        return response()->json(
            Internship::with([
                'student.user',
                'supervisor.user',
                'supervisor.department',
                'topic',
                'department'
            ])->get()
        );
    }

    /**
     * AFFECTATION AUTOMATIQUE D'UN STAGE
     */
    public function assign(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'supervisor_id' => 'required|exists:supervisors,id',
            'topic_id' => 'required|exists:topics,id',
        ]);

        // 🔍 vérifier si le stagiaire a déjà un stage actif
        $existing = Internship::where('student_id', $request->student_id)
            ->whereIn('status', ['Assigné', 'En cours'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Ce stagiaire a déjà un stage actif'
            ], 400);
        }

        // 🔎 récupérer le superviseur
        $supervisor = Supervisor::findOrFail($request->supervisor_id);

        // 📦 création du stage avec département hérité
        $internship = Internship::create([
            'student_id' => $request->student_id,
            'supervisor_id' => $request->supervisor_id,
            'topic_id' => $request->topic_id,
            'department_id' => $supervisor->department_id,
            'date_debut' => now(),
            'status' => 'Assigné',
            'progress_percentage' => 0
        ]);

        return response()->json([
            'message' => 'Stage affecté avec succès',
            'internship' => $internship->load([
                'student.user',
                'supervisor.user',
                'supervisor.department',
                'topic'
            ])
        ]);
    }

    /**
     * UPDATE INTERNSHIP STATUS
     */
    public function update(Request $request, $id)
    {
        $internship = Internship::find($id);

        if (!$internship) {
            return response()->json(['message' => 'Stage introuvable'], 404);
        }

        $internship->update($request->only(['status', 'progress_percentage', 'date_fin']));

        return response()->json([
            'message' => 'Stage mis à jour',
            'internship' => $internship
        ]);
    }
}