<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * 📥 Liste des notifications de l'utilisateur connecté
     */
    public function index()
    {
        return Notification::where('user_id', Auth::id())
            ->latest()
            ->get();
    }

    /**
     * ➕ Créer une notification (option admin / système)
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'message' => 'required|string',
            'type' => 'nullable|string'
        ]);

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type ?? 'info',
            'is_read' => false
        ]);

        return response()->json($notification);
    }

    /**
     * 👁️ Voir une notification
     */
    public function show(string $id)
    {
        return Notification::where('user_id', Auth::id())
            ->findOrFail($id);
    }

    /**
     * ✅ Marquer comme lu
     */
    public function update(Request $request, string $id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->update([
            'is_read' => true
        ]);

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ]);
    }

    /**
     * 🗑️ Supprimer notification
     */
    public function destroy(string $id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'message' => 'Notification supprimée'
        ]);
    }
}