<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Supervisor;
use App\Models\Department;
use App\Models\Topic;
use App\Models\Internship;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create Supervisor
        $supervisorUser = User::create([
            'name' => 'Mme Amel Tounsi',
            'email' => 'sup@test.com',
            'password' => Hash::make('password123'),
            'role' => 'supervisor',
        ]);

        $supervisor = Supervisor::create([
            'user_id' => $supervisorUser->id,
            'specialty' => 'Développement Web',
        ]);

        // Create Student
        $studentUser = User::create([
            'name' => 'Islem Trabelsi',
            'email' => 'student@test.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
        ]);

        $student = Student::create([
            'user_id' => $studentUser->id,
            'university' => 'Université de Tunis',
            'specialty' => 'Ingénierie Logicielle',
        ]);

        // Create Department
        $department = Department::create([
            'nom' => 'Développement',
        ]);

        // Create Topic
        $topic = Topic::create([
            'title' => 'Plateforme StageTT',
            'description' => 'Plateforme de gestion des stages internes',
            'supervisor_id' => $supervisor->id,
            'status' => 'disponible',
        ]);

        // Create Internship
        $internship = Internship::create([
            'student_id' => $student->id,
            'supervisor_id' => $supervisor->id,
            'topic_id' => $topic->id,
            'date_debut' => now(),
            'date_fin' => now()->addWeeks(8),
            'status' => 'en_cours',
        ]);

        // Create Conversation
        $conversation = Conversation::create([
            'topic_id' => $topic->id,
            'type' => 'private'
        ]);
        $conversation->users()->attach([$studentUser->id, $supervisorUser->id]);

        // Create sample messages
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $supervisorUser->id,
            'content' => 'Bonjour Islem, où en est le diagramme UML ?'
        ]);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $studentUser->id,
            'content' => 'Bonjour Madame, il sera terminé aujourd\'hui.'
        ]);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $supervisorUser->id,
            'content' => 'Parfait, pensez aussi aux diagrammes de séquence.'
        ]);
    }
}