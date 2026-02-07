<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define initial structure
        $accounts = [
            'asset' => [
                'name' => 'Asset',
                'children' => ['Kas', 'Bank', 'Piutang']
            ],
            'liability' => [
                'name' => 'Liability',
                'children' => ['Hutang Usaha']
            ],
            'equity' => [
                'name' => 'Equity',
                'children' => ['Modal Pemilik']
            ],
            'revenue' => [
                'name' => 'Revenue',
                'children' => ['Pendapatan Jasa']
            ],
            'expense' => [
                'name' => 'Expense',
                'children' => ['Beban Gaji', 'Beban Sewa', 'Beban Listrik']
            ],
        ];

        foreach ($accounts as $type => $data) {
            // Create Parent
            $parentCode = $this->accountService->generateCode($type);
            $parent = Account::create([
                'code' => $parentCode,
                'name' => $data['name'],
                'type' => $type,
                'is_active' => true,
            ]);

            // Create Children
            foreach ($data['children'] as $childName) {
                $childCode = $this->accountService->generateCode($type);
                Account::create([
                    'parent_id' => $parent->id,
                    'code' => $childCode,
                    'name' => $childName,
                    'type' => $type,
                    'is_active' => true,
                ]);
            }
        }
    }
}
