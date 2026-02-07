<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'unique:accounts,code,' . $this->route('account')->id,
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:asset,liability,equity,revenue,expense'],
            'parent_id' => [
                'nullable',
                'exists:accounts,id',
                function ($attribute, $value, $fail) {
                    if ($value == $this->route('account')->id) {
                        $fail('The account cannot be its own parent.');
                    }
                },
            ],
            'is_active' => ['boolean'],
        ];
    }
}
