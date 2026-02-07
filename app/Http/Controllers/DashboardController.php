<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Fetch all accounts with their calculated debit/credit sums
        $accounts = Account::withSum('transactionDetails as total_debit', 'debit')
            ->withSum('transactionDetails as total_credit', 'credit')
            ->orderBy('code')
            ->get();

        // Calculate the net balance for each account
        $accounts->transform(function ($account) {
            $prefix = substr($account->code, 0, 1);
            
            // Assets (1) and Expenses (5) are Debit normal
            // Liabilities (2), Equity (3), and Revenue (4) are Credit normal
            $isDebitNormal = in_array($prefix, ['1', '5']);
            
            $debit = $account->total_debit ?? 0;
            $credit = $account->total_credit ?? 0;
            
            if ($isDebitNormal) {
                $account->balance = $debit - $credit;
            } else {
                $account->balance = $credit - $debit;
            }
            
            return $account;
        });

        return Inertia::render('Dashboard', [
            'accounts' => $accounts
        ]);
    }
}
