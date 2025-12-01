<?php

namespace App\Policies;

use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\User;

class UserPolicy
{
    use HandlesAuthorization;
    
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_user');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermission('view_user');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create_user');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermission('edit_user');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermission('delete_user');
    }

}
