<?php

namespace App\Http\Controllers;

use App\Models\Supervisor;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Supervisor::with(['user', 'department', 'topics', 'internships'])->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'poste' => 'nullable|string'
        ]);

        $supervisor = Supervisor::create($request->all());

        return response()->json([
            'message' => 'Encadrant créé avec succès',
            'supervisor' => $supervisor->load(['user', 'department'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $supervisor = Supervisor::with(['user', 'department', 'topics', 'internships'])->find($id);

        if (!$supervisor) {
            return response()->json(['message' => 'Encadrant introuvable'], 404);
        }

        return response()->json($supervisor);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $supervisor = Supervisor::find($id);

        if (!$supervisor) {
            return response()->json(['message' => 'Encadrant introuvable'], 404);
        }

        $supervisor->update($request->all());

        return response()->json([
            'message' => 'Encadrant mis à jour',
            'supervisor' => $supervisor->load(['user', 'department'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $supervisor = Supervisor::find($id);

        if (!$supervisor) {
            return response()->json(['message' => 'Encadrant introuvable'], 404);
        }

        $supervisor->delete();

        return response()->json(['message' => 'Encadrant supprimé']);
    }
}
