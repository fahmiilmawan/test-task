<?php

namespace App\Services;

use App\Models\Account;

class AccountService
{
    protected const PREFIXES = [
        'asset' => '1',
        'liability' => '2',
        'equity' => '3',
        'revenue' => '4',
        'expense' => '5',
    ];

    public function generateCode(string $type): string
    {
        $prefix = self::PREFIXES[$type] ?? throw new \InvalidArgumentException("Invalid account type: {$type}");
        
        // Find the latest account with this prefix
        $latestAccount = Account::where('code', 'like', "{$prefix}%")
            ->orderByRaw('CAST(code AS UNSIGNED) DESC')
            ->first();

        if (!$latestAccount) {
            return "{$prefix}000";
        }

        $lastCode = (int) $latestAccount->code;
        return (string) ($lastCode + 1);
    }
}
