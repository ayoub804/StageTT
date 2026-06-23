<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\InternshipController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DeliverableController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AIController;

/*
|--------------------------------------------------------------------------
| AUTH (PUBLIC)
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | USER CONNECTÉ
    |--------------------------------------------------------------------------
    */

    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | KANBAN
    |--------------------------------------------------------------------------
    */

    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);

    /*
    |--------------------------------------------------------------------------
    | IA PLANNING
    |--------------------------------------------------------------------------
    */

    Route::post('/ai/generate-plan', [AIController::class, 'generatePlan']);
    Route::get('/ai/plan', [AIController::class, 'getPlan']);

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [DashboardController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        Route::apiResource('users', UserController::class);

        Route::apiResource('students', StudentController::class);

        Route::apiResource('supervisors', SupervisorController::class);

        Route::apiResource('departments', DepartmentController::class);

        /*
        |--------------------------------------------------------------------------
        | Affectation Stage
        |--------------------------------------------------------------------------
        */

        Route::post('/assign-internship', [InternshipController::class, 'assign']);
        Route::put('/internships/{id}', [InternshipController::class, 'update']);
    });

    /*
    |--------------------------------------------------------------------------
    | SUPERVISOR ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:supervisor')->group(function () {

        Route::post('/topics', [TopicController::class, 'store']);
        Route::put('/topics/{id}', [TopicController::class, 'update']);
        Route::delete('/topics/{id}', [TopicController::class, 'destroy']);

        /*
        |--------------------------------------------------------------------------
        | Validation Livrables
        |--------------------------------------------------------------------------
        */

        Route::patch(
            '/deliverables/{id}/validate',
            [DeliverableController::class, 'validateDeliverable']
        );
        Route::patch(
            '/deliverables/{id}/reject',
            [DeliverableController::class, 'rejectDeliverable']
        );
    });

    /*
    |--------------------------------------------------------------------------
    | COMMUNICATION & SHARED RESOURCES
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin,supervisor,student')->group(function () {

        Route::apiResource('conversations', ConversationController::class);

        Route::get('/messages', [MessageController::class, 'index']);
        Route::post('/messages', [MessageController::class, 'store']);
        Route::get('/messages/{id}', [MessageController::class, 'show']);
        Route::put('/messages/{id}', [MessageController::class, 'update']);
        Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

        Route::apiResource('notifications', NotificationController::class);

        Route::get('/topics', [TopicController::class, 'index']);
        Route::get('/topics/{id}', [TopicController::class, 'show']);

        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::get('/tasks/{id}', [TaskController::class, 'show']);
        Route::put('/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

        Route::get('/deliverables', [DeliverableController::class, 'index']);
        Route::post('/deliverables', [DeliverableController::class, 'store']);
        Route::get('/deliverables/{id}', [DeliverableController::class, 'show']);
        Route::put('/deliverables/{id}', [DeliverableController::class, 'update']);
        Route::delete('/deliverables/{id}', [DeliverableController::class, 'destroy']);
        Route::get('/deliverables/{id}/download', [DeliverableController::class, 'download']);

        Route::get('/internships', [InternshipController::class, 'index']);
    });
});