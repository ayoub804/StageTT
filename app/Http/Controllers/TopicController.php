<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TopicController extends Controller
{
    /**
     * LIST TOPICS
     */
    public function index()
    {
        return response()->json(
            Topic::with('supervisor.user')->get()
        );
    }

    /**
     * CREATE TOPIC (SUPERVISOR ONLY)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'technologies' => 'nullable',
            'duree' => 'nullable|string',
            'status' => 'nullable'
        ]);

        $topic = Topic::create([
            'supervisor_id' => Auth::user()->supervisor->id,
            'title' => $request->title,
            'description' => $request->description,
            'technologies' => $request->technologies,
            'duree' => $request->duree,
            'status' => $request->status ?? 'Disponible'
        ]);

        return response()->json([
            'message' => 'Sujet créé avec succès',
            'topic' => $topic
        ]);
    }

    /**
     * SHOW TOPIC
     */
    public function show($id)
    {
        $topic = Topic::with('supervisor.user')->find($id);

        if (!$topic) {
            return response()->json(['message' => 'Sujet introuvable'], 404);
        }

        return response()->json($topic);
    }

    /**
     * UPDATE TOPIC
     */
    public function update(Request $request, $id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json(['message' => 'Sujet introuvable'], 404);
        }

        $topic->update($request->all());

        return response()->json([
            'message' => 'Sujet mis à jour',
            'topic' => $topic
        ]);
    }

    /**
     * DELETE TOPIC
     */
    public function destroy($id)
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json(['message' => 'Sujet introuvable'], 404);
        }

        $topic->delete();

        return response()->json([
            'message' => 'Sujet supprimé'
        ]);
    }
}
