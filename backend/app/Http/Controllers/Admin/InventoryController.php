<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\InventoryService;



class InventoryController extends Controller
{
    protected $inventory;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventory = $inventoryService;
    }
    
    // Lấy thông tin
    public function index()
    {
        
        return response()->json([
            'success' => true,
            'data' => $this->inventory->getAll()
        ]);
    }
    
    //xem chi tiết phiếu kho
    public function getNoteDetail($noteId)
    {
        
        return response()->json([
            'success' => true,
            'data' => $this->inventory->getNoteDetail($noteId)
        ]);
    }


    //Nhập kho
    public function importStock(Request $request)
    {
 
        $note = $this->inventory->importStock($request->all());
        return response()->json([
            'success' => true,
             'data' => $note
        ]);  
    }

    //Xuất kho
    public function exportStock(Request $request)
    {

        $note = $this->inventory->exportStock($request->all());
        return response()->json([
            'success' => true,
            'data' => $note
        ]);
       
    }

    //Điều chỉnh tồn kho
    public function adjustStock(Request $request)
    {
   
        $note = $this->inventory->adjustStock($request->all());
        return response()->json([
            'success' => true,
            'data' => $note
        ]);
       
    }

   // Lịch sử kho
    public function variantHistory($variantId)
    {
        $history = $this->inventory->getVariantHistory($variantId);
        return response()->json([
            'success' => true,
             'data' => $history
        ]);
       
    }
}
