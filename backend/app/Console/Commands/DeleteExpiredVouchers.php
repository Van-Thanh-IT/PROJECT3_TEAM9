<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
// php artisan make:command DeleteExpiredVouchers

class DeleteExpiredVouchers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:delete-expired-vouchers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $expired = Voucher::where('end_date', '<', $now)->get();

        foreach ($expired as $voucher) {
            $voucher->delete();
        }

        $this->info("Đã xóa " . $expired->count() . " voucher hết hạn.");
    }

}
