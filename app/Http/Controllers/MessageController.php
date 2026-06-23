<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id'
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        if (!$conversation->users->contains(Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()->with('user')->get();
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string',
            'attachment' => 'nullable|string'
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        if (!$conversation->users->contains(Auth::id())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'user_id' => Auth::id(),
            'content' => $request->content,
            'attachment' => $request->attachment
        ]);

        return response()->json($message->load('user'), 201);
    }

    public function show($id)
    {
        $message = Message::with('user')->findOrFail($id);
        return response()->json($message);
    }

    public function update(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        if ($message->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update($request->only(['content']));
        return response()->json($message->load('user'));
    }

    public function destroy($id)
    {
        $message = Message::findOrFail($id);

        if ($message->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();
        return response()->json(null, 204);
    }
}
