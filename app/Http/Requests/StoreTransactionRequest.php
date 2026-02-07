<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use App\Models\Account;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $details = $this->input('details', []);

        if (is_array($details)) {
            foreach ($details as $key => $detail) {
                if (!isset($detail['debit']) || $detail['debit'] === '' || $detail['debit'] === null) {
                    $details[$key]['debit'] = 0;
                }
                if (!isset($detail['credit']) || $detail['credit'] === '' || $detail['credit'] === null) {
                    $details[$key]['credit'] = 0;
                }
            }
            $this->merge(['details' => $details]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.account_id' => [
                'required',
                'exists:accounts,id',
                function ($attribute, $value, $fail) {
                    $account = Account::find($value);
                    if ($account && !$account->is_active) {
                        $fail('The selected account is inactive.');
                    }
                }
            ],
            'details.*.debit' => ['required', 'numeric', 'min:0'],
            'details.*.credit' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $details = $this->input('details', []);

            if (!is_array($details) || empty($details)) {
                return;
            }

            $totalDebit = 0;
            $totalCredit = 0;

            foreach ($details as $index => $detail) {
                $debit = (float) ($detail['debit'] ?? 0);
                $credit = (float) ($detail['credit'] ?? 0);

                if ($debit > 0 && $credit > 0) {
                    $validator->errors()->add("details.$index.debit", "Row " . ($index + 1) . ": Cannot have both debit and credit.");
                }

                if ($debit == 0 && $credit == 0) {
                    $validator->errors()->add("details.$index.debit", "Row " . ($index + 1) . ": Must have either debit or credit.");
                }

                $totalDebit += $debit;
                $totalCredit += $credit;
            }

            // Double entry check removed per user request
            // if (count($details) > 1) {
            //     if (abs($totalDebit - $totalCredit) > 0.001) {
            //         $validator->errors()->add('details', "Transaction is not balanced. Total Debit: " . number_format($totalDebit, 2) . ", Total Credit: " . number_format($totalCredit, 2) . ".");
            //     }
            // }
        });
    }
}
