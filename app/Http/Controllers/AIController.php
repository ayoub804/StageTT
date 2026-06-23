<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Plan;
use App\Models\PlanTask;
use App\Models\Internship;

class AIController extends Controller
{
    public function generatePlan(Request $request)
    {
        try {
            $request->validate([
                'internship_id' => 'sometimes|exists:internships,id',
                'topic' => 'required|string'
            ]);

            $internship = null;
            if ($request->internship_id) {
                $internship = Internship::findOrFail($request->internship_id);
            } else {
                // Create a dummy internship if none is provided for testing
                $internship = Internship::create([
                    'date_debut' => now(),
                    'date_fin' => now()->addWeeks(8),
                    'status' => 'active'
                ]);
            }

            // 🤖 PROMPT IA
            $prompt = "Créer un planning de stage de 8 semaines pour un projet intitulé : "
                . $request->topic .
                ". Donne une liste claire semaine par semaine.";

            // 🤖 Appel DeepSeek API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.deepseek.com/v1/chat/completions', [
                'model' => 'deepseek-chat',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ]
            ]);

            $text = "";
            if (!$response->successful()) {
                \Illuminate\Support\Facades\Log::warning('DeepSeek API failed with status ' . $response->status() . '. Falling back to template generation.');
                
                $topicLower = strtolower($request->topic);
                
                if (str_contains($topicLower, 'réseau') || str_contains($topicLower, 'network') || str_contains($topicLower, 'telecom') || str_contains($topicLower, 'télécom')) {
                    $text = "Semaine 1 : Analyse de l'architecture réseau existante et spécifications\n"
                          . "Semaine 2 : Étude de faisabilité et définition des protocoles de communication\n"
                          . "Semaine 3 : Configuration de l'environnement de test et simulation de trafic\n"
                          . "Semaine 4 : Implémentation des règles de routage et de sécurité initiales\n"
                          . "Semaine 5 : Automatisation des tâches réseau (scripts Python, Ansible)\n"
                          . "Semaine 6 : Intégration des dashboards de supervision et de monitoring\n"
                          . "Semaine 7 : Tests de charge, de vulnérabilité et optimisation des performances\n"
                          . "Semaine 8 : Rédaction du rapport technique de stage et préparation de la soutenance";
                } else if (str_contains($topicLower, 'mobile') || str_contains($topicLower, 'android') || str_contains($topicLower, 'ios') || str_contains($topicLower, 'flutter') || str_contains($topicLower, 'react native')) {
                    $text = "Semaine 1 : Spécifications fonctionnelles et maquettage UI/UX mobile\n"
                          . "Semaine 2 : Configuration du projet mobile (SDK) et choix de l'état de l'application\n"
                          . "Semaine 3 : Création des vues principales et de la navigation mobile\n"
                          . "Semaine 4 : Intégration des APIs REST backend et stockage local (SQLite/Room)\n"
                          . "Semaine 5 : Implémentation des push notifications et services d'arrière-plan\n"
                          . "Semaine 6 : Tests unitaires sur simulateur et intégration de capteurs natifs\n"
                          . "Semaine 7 : Déploiement en bêta-test et résolution des retours utilisateurs\n"
                          . "Semaine 8 : Préparation du livrable final, rapport et slides de soutenance";
                } else {
                    // Default software / platform development
                    $text = "Semaine 1 : Analyse des besoins et rédaction des spécifications fonctionnelles pour : " . $request->topic . "\n"
                          . "Semaine 2 : Conception de l'architecture logicielle, diagrammes UML et base de données\n"
                          . "Semaine 3 : Configuration de l'environnement et initialisation du projet (backend/frontend)\n"
                          . "Semaine 4 : Développement des fonctionnalités backend de base et modélisation des données\n"
                          . "Semaine 5 : Développement des composants frontend et intégration avec les APIs du backend\n"
                          . "Semaine 6 : Implémentation des fonctionnalités avancées et de la sécurité (authentification)\n"
                          . "Semaine 7 : Phase de tests unitaires, d'intégration et correction globale des bugs\n"
                          . "Semaine 8 : Rédaction du rapport de stage de Tunisie Telecom et préparation finale de la soutenance";
                }
            } else {
                $responseData = $response->json();
                if (!isset($responseData['choices'][0]['message']['content'])) {
                    \Illuminate\Support\Facades\Log::error('Invalid DeepSeek response structure: ' . json_encode($responseData));
                    return response()->json([
                        'message' => 'Réponse invalide de l\'API',
                        'response' => $responseData
                    ], 500);
                }
                $text = $responseData['choices'][0]['message']['content'];
            }

            // 💾 Création plan
            $plan = Plan::create([
                'internship_id' => $internship->id,
                'generated_by_ai' => true
            ]);

            // 🧠 découpage simple
            $lines = explode("\n", $text);
            $tasks = [];

            foreach ($lines as $line) {
                $trimmedLine = trim($line);
                if (!empty($trimmedLine)) {
                    PlanTask::create([
                        'plan_id' => $plan->id,
                        'title' => $trimmedLine,
                        'status' => 'À faire'
                    ]);
                    $tasks[] = $trimmedLine;
                }
            }

            return response()->json([
                'message' => 'Planning généré avec succès',
                'plan' => $plan,
                'tasks' => $tasks
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('AI Generation Exception: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'message' => 'Erreur lors de la génération',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function getPlan()
    {
        $user = auth()->user();
        $internship = null;

        if ($user->role === 'student') {
            $student = $user->student;
            $internship = $student ? $student->internships()->first() : null;
        } elseif ($user->role === 'supervisor') {
            $supervisor = $user->supervisor;
            $internship = $supervisor ? $supervisor->internships()->first() : null;
        } else {
            $internship = Internship::first();
        }

        if (!$internship) {
            return response()->json(['message' => 'Aucun stage trouvé.'], 404);
        }

        $plan = Plan::where('internship_id', $internship->id)->latest()->first();

        if (!$plan) {
            return response()->json(['message' => 'Aucun planning généré.'], 404);
        }

        $tasks = PlanTask::where('plan_id', $plan->id)->pluck('title');

        return response()->json([
            'plan' => $plan,
            'tasks' => $tasks
        ]);
    }
}