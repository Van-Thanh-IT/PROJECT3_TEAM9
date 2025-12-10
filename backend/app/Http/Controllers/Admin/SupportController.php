<?php

namespace App\Http\Controllers\Admin;

use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Traits\CloudinaryUpload;

class SupportController extends Controller
{
    use CloudinaryUpload;

    /**
     * TẠO CUỘC TRÒ CHUYỆN MỚI (User bắt đầu chat)
     */
    public function createTicket(Request $request)
    {
        $user = Auth::user();

        // 1. Kiểm tra xem User này đã có Ticket nào đang MỞ chưa?
        // Nếu có rồi thì trả về Ticket cũ luôn, không tạo mới (để gom vào 1 luồng chat duy nhất)
        $existingTicket = SupportTicket::where('user_id', $user->id)
            ->where('status', '!=', 'closed') // Chỉ tính các ticket chưa đóng
            ->first();

        if ($existingTicket) {
            return response()->json($existingTicket);
        }

        // 2. Nếu chưa có, tạo mới
        $request->validate([
            'subject' => 'nullable|string|max:255', // Subject có thể null, hệ thống tự điền
            'order_id' => 'nullable|integer',
            'email' => 'nullable|email'
        ]);

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'email' => $request->email ?? $user->email,
            'order_id' => $request->order_id,
            'subject' => $request->subject ?? 'Yêu cầu hỗ trợ mới', // Tự đặt tiêu đề nếu thiếu
            'status' => 'open',
        ]);

        return response()->json($ticket);
    }

    /**
     * LẤY DANH SÁCH HỘI THOẠI (Inbox)
     */
    public function listTickets()
    {
        $user = Auth::user();
        $role = $user->roles->pluck('name')->toArray();
        // --- TRƯỜNG HỢP 1: STAFF / ADMIN (Xem hộp thư đến) ---
        if (in_array('admin', $role) || in_array('staff_customer_support', $role) ) {
            // Lấy tất cả ticket, sắp xếp tin nhắn mới nhất lên đầu
            // Eager load 'user' để hiển thị tên và avatar khách hàng
            $tickets = SupportTicket::with('user')
                ->where('status', '!=', 'closed') // (Tùy chọn) Chỉ hiện các ticket đang mở
                ->orderBy('updated_at', 'desc')   // Ticket nào mới có tin nhắn/tạo mới thì lên đầu
                ->get();
             return response()->json($tickets);   
        } 
        // --- TRƯỜNG HỢP 2: USER THƯỜNG (Xem lịch sử của mình) ---
        else {
            $tickets = SupportTicket::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($tickets);
    }

    /**
     * XEM NỘI DUNG CUỘC TRÒ CHUYỆN
     */
    public function getMessages($ticketId)
    {
        $user = Auth::user();
        $ticket = SupportTicket::findOrFail($ticketId);
        
         $roles = $user->roles->pluck('name')->toArray();
        // Check quyền: Chỉ Staff/Admin HOẶC Chủ sở hữu ticket mới được xem
        $canView = (in_array('admin', $roles) || in_array('staff_customer_support', $roles)) 
                   || ($ticket->user_id === $user->id);

        if (!$canView) {
            return response()->json(['message' => 'Bạn không có quyền xem cuộc trò chuyện này'], 403);
        }

        $messages = SupportMessage::where('ticket_id', $ticketId)
            ->with('sender') // Lấy thông tin người gửi (Avatar, Tên)
            ->orderBy('created_at', 'asc') // Sắp xếp cũ -> mới (chat flow)
            ->get();

        return response()->json($messages);
    }

    /**
     * GỬI TIN NHẮN (2 Chiều: User -> Staff HOẶC Staff -> User)
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'ticket_id' => 'required|integer|exists:support_tickets,id',
            'message' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // Max 10MB
        ]);

        if (!$request->message && !$request->hasFile('file')) {
            return response()->json(['message' => 'Nội dung trống'], 422);
        }

        $user = Auth::user();
        $ticket = SupportTicket::findOrFail($request->ticket_id);

        $roles = $user->roles->pluck('name');
        // Check quyền gửi
        $canSend = $roles->contains('admin') || $roles->contains('staff_customer_support') || ($ticket->user_id === $user->id);

        if (!$canSend) {
            return response()->json(['message' => 'Không có quyền gửi tin nhắn'], 403);
        }

        // 1. Upload file (nếu có)
        $attachmentUrl = null;
        $attachmentType = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $attachmentUrl = $this->uploadToCloudinary($file); 
            $attachmentType = $file->getMimeType();
        }

        // 2. Xác định vai trò người gửi (để Frontend hiển thị bên trái/phải)
        // Lưu ý: Code cũ của bạn check role admin/staff nhưng nếu user thường gửi thì sao?
        // Logic dưới đây đảm bảo đúng role:
       $roles = $user->roles->pluck('name'); // Collection

        $senderType = 'user'; // mặc định

        if ($roles->contains('admin')) {
            $senderType = 'admin';
        } elseif ($roles->contains('staff_customer_support')) {
            $senderType = 'staff_customer_support';
        }

        // 3. Tạo tin nhắn
        $message = SupportMessage::create([
            'ticket_id' => $request->ticket_id,
            'sender_id' => $user->id,
            'sender_type' => $senderType,
            'message' => $request->message,
            'attachment_url' => $attachmentUrl,
            'attachment_type' => $attachmentType,
        ]);

        $status = ($senderType === 'user') ? 'open' : 'processing';
        
        $ticket->update([
            'status' => $status,
            'updated_at' => now() // Quan trọng để sort listTickets
        ]);

        // 5. Bắn Realtime
        // User khác xem (vd Admin xem) sẽ nhận được sự kiện này
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender'));
    }

}