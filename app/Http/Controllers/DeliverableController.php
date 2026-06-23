<?php

namespace App\Http\Controllers;

use App\Models\Deliverable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliverableController extends Controller
{
    /**
     * Liste des livrables
     */
    public function index()
    {
        $user = auth()->user();
        if ($user->role === 'student') {
            $student = $user->student;
            if (!$student) return [];
            $internship = $student->internships()->first();
            if (!$internship) return [];
            return Deliverable::where('internship_id', $internship->id)->get();
        } elseif ($user->role === 'supervisor') {
            $supervisor = $user->supervisor;
            if (!$supervisor) return [];
            $internshipIds = $supervisor->internships()->pluck('id');
            return Deliverable::whereIn('internship_id', $internshipIds)->with('internship.student.user')->get();
        } else {
            return Deliverable::with('internship.student.user')->get();
        }
    }

    /**
     * Ajouter un livrable
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
            'title' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'file' => 'required|file|max:10240'
        ]);

        $path = $request->file('file')->store('deliverables', 'public');

        $deliverable = Deliverable::create([
            'internship_id' => $internshipId,
            'title' => $request->title,
            'type' => $request->type ?? 'PDF',
            'file_path' => $path,
            'status' => 'Déposé'
        ]);

        return response()->json([
            'message' => 'Livrable ajouté avec succès',
            'deliverable' => $deliverable
        ], 201);
    }

    /**
     * Afficher un livrable
     */
    public function show(string $id)
    {
        return Deliverable::with('internship')->findOrFail($id);
    }

    /**
     * Modifier un livrable
     */
    public function update(Request $request, string $id)
    {
        $deliverable = Deliverable::findOrFail($id);

        $deliverable->update([
            'title' => $request->title ?? $deliverable->title,
            'type' => $request->type ?? $deliverable->type,
            'status' => $request->status ?? $deliverable->status,
        ]);

        return response()->json([
            'message' => 'Livrable modifié avec succès',
            'deliverable' => $deliverable
        ]);
    }

    /**
     * Supprimer un livrable
     */
    public function destroy(string $id)
    {
        $deliverable = Deliverable::findOrFail($id);

        if ($deliverable->file_path) {
            Storage::disk('public')->delete($deliverable->file_path);
        }

        $deliverable->delete();

        return response()->json([
            'message' => 'Livrable supprimé avec succès'
        ]);
    }

    /**
     * Télécharger le fichier PDF associé
     */
    public function download(string $id)
    {
        $deliverable = Deliverable::findOrFail($id);

        if (!$deliverable->file_path || !Storage::disk('public')->exists($deliverable->file_path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        return Storage::disk('public')->download($deliverable->file_path, $deliverable->title . '.pdf');
    }

    /**
     * Validation par l'encadrant
     */
    public function validateDeliverable(string $id)
    {
        $deliverable = Deliverable::findOrFail($id);

        $deliverable->update([
            'status' => 'Validé'
        ]);

        return response()->json([
            'message' => 'Livrable validé avec succès',
            'deliverable' => $deliverable
        ]);
    }

    /**
     * Refuser un livrable (option utile)
     */
    public function rejectDeliverable(string $id)
    {
        $deliverable = Deliverable::findOrFail($id);

        $deliverable->update([
            'status' => 'Refusé'
        ]);

        return response()->json([
            'message' => 'Livrable refusé',
            'deliverable' => $deliverable
        ]);
    }
}