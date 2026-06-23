<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $conversations = $user->conversations()
            ->with(['users', 'messages' => function($query) {
                $query->latest()->take(1);
            }])
            ->get()
            ->map(function($conversation) use ($user) {
                $otherUser = $conversation->users->where('id', '!=', $user->id)->first();
                $lastMessage = $conversation->messages->first();
                return [
                    'id' => $conversation->id,
                    'name' => $otherUser ? $otherUser->name : 'Groupe',
                    'other_user' => $otherUser,
                    'last_message' => $lastMessage,
                    'created_at' => $conversation->created_at,
                ];
            });
        
        return response()->json($conversations);
    }

    public function show($id)
    {
        $conversation = Conversation::with(['users', 'messages.user'])->findOrFail($id);
        
        // Vérifiez que l'utilisateur est dans la conversation
        if (!$conversation->users->contains(Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json($conversation);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'topic_id' => 'nullable|exists:topics,id',
            'type' => 'nullable|string'
        ]);

        $conversation = Conversation::create([
            'topic_id' => $request->topic_id,
            'type' => $request->type
        ]);

        // Ajouter l'utilisateur connecté et les autres
        $userIds = array_merge([Auth::id()], $request->user_ids);
        $conversation->users()->attach($userIds);

        return response()->json($conversation->load('users'), 201);
    }

    public function update(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);
        
        if (!$conversation->users->contains(Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->update($request->only(['topic_id', 'type']));
        return response()->json($conversation);
    }

    public function destroy($id)
    {
        $conversation = Conversation::findOrFail($id);
        
        if (!$conversation->users->contains(Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->delete();
        return response()->json(null, 204);
    }
}
