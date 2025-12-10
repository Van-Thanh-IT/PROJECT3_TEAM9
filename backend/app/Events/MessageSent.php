<?php

namespace App\Events;

use App\Models\SupportMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(SupportMessage $message)
    {
        $this->message = $message->load('sender');
    }

    /**
     * Kênh broadcast (private theo ticket)
     */
    public function broadcastOn()
    {
        return new Channel('ticket.' . $this->message->ticket_id);
    }

    /**
     * Tên event gửi xuống frontend
     */
    public function broadcastAs()
    {
        return 'MessageSent';
    }

    /**
     * Payload gửi tới Reverb → React nhận
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'ticket_id' => $this->message->ticket_id,
            'sender_id' => $this->message->sender_id,
            'sender_type' => $this->message->sender_type,
            'message' => $this->message->message,
            'attachment_url' => $this->message->attachment_url,
            'attachment_type' => $this->message->attachment_type,
            'created_at' => $this->message->created_at->toDateTimeString(),

            'sender' => [
                'id' => $this->message->sender?->id,
                'name' => $this->message->sender?->name,
                'avatar' => $this->message->sender?->avatar ?? null,
            ]
        ];
    }
}
