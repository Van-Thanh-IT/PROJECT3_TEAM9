<?php

namespace App\Traits;

use App\Models\UserLog;

trait LogUserAction
{
   /**
     * Ghi log hành động user
     *
     * @param string $action
     * @param int|null $userId Nếu null sẽ dùng auth()->id()
     */
    public function logAction($action, $userId = null)
    {
        $userId = $userId ?? auth()->id();

        dispatch(function() use ($action, $userId) {
            \App\Models\UserLog::create([
                'user_id'    => $userId,
                'action'     => $action,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
            ]);
        });
    }
}
