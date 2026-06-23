<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Student::with(['user', 'internship.supervisor.user', 'internship.supervisor.department', 'internship.topic'])->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'specialite' => 'nullable|string',
            'niveau' => 'nullable|string',
            'competences' => 'nullable|string',
            'cv_path' => 'nullable|string',
        ]);

        $student = Student::create($request->all());

        return response()->json([
            'message' => 'Étudiant créé avec succès',
            'student' => $student->load(['user', 'internship'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::with(['user', 'internship.supervisor.user', 'internship.topic'])->find($id);

        if (!$student) {
            return response()->json(['message' => 'Étudiant introuvable'], 404);
        }

        return response()->json($student);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Étudiant introuvable'], 404);
        }

        $student->update($request->all());

        return response()->json([
            'message' => 'Étudiant mis à jour',
            'student' => $student->load(['user', 'internship'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Étudiant introuvable'], 404);
        }

        $student->delete();

        return response()->json(['message' => 'Étudiant supprimé']);
    }
}
