<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryNote extends Model
{
    protected $table = 'inventory_notes';

    protected $fillable = [
        'code',
        'type',
        'reason',
        'user_id',
        'supplier_name',
        'total_amount',
        'note'
    ];

    public $timestamps = false;

    // Phiếu kho thuộc về 1 user (nhân viên)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Phiếu kho có nhiều dòng chi tiết
    public function details()
    {
        return $this->hasMany(InventoryNoteDetail::class, 'inventory_note_id');
    }
}
