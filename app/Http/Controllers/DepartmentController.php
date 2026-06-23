<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Department::with(['supervisors.user'])->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|unique:departments,nom',
            'description' => 'nullable|string'
        ]);

        $department = Department::create($request->all());

        return response()->json([
            'message' => 'Département créé avec succès',
            'department' => $department
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $department = Department::with(['supervisors.user', 'internships'])->find($id);

        if (!$department) {
            return response()->json(['message' => 'Département introuvable'], 404);
        }

        return response()->json($department);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Département introuvable'], 404);
        }

        $department->update($request->all());

        return response()->json([
            'message' => 'Département mis à jour',
            'department' => $department
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json(['message' => 'Département introuvable'], 404);
        }

        $department->delete();

        return response()->json(['message' => 'Département supprimé']);
    }
}
