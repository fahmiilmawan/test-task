import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Create({ accounts }) {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        details: [
            { account_id: '', debit: '', credit: '' }
        ]
    });

    const addRow = () => {
        setData('details', [...data.details, { account_id: '', debit: '', credit: '' }]);
    };

    const removeRow = (index) => {
        const newDetails = [...data.details];
        newDetails.splice(index, 1);
        setData('details', newDetails);
    };

    const updateRow = (index, field, value) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;

        // UX: Prevent entering debit and credit in the same row
        if (field === 'debit' && Number(value) > 0) {
            newDetails[index]['credit'] = '';
        }
        if (field === 'credit' && Number(value) > 0) {
            newDetails[index]['debit'] = '';
        }

        setData('details', newDetails);
    };

    // Calculate totals for display
    const totalDebit = data.details.reduce((sum, row) => sum + Number(row.debit || 0), 0);
    const totalCredit = data.details.reduce((sum, row) => sum + Number(row.credit || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const submit = (e) => {
        e.preventDefault();
        post(route('transaction.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Transaction</h2>}
        >
            <Head title="Create Transaction" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Header Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="date" value="Date" />
                                        <TextInput
                                            id="date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="description" value="Description" />
                                        <TextInput
                                            id="description"
                                            className="mt-1 block w-full"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
                                    <InputError message={errors.details} className="mb-4" />

                                    <div className="space-y-4">
                                        {data.details.map((detail, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start border p-4 rounded bg-gray-50">
                                                <div className="flex-1 w-full">
                                                    <InputLabel value={`Account #${index + 1}`} />
                                                    <select
                                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                        value={detail.account_id}
                                                        onChange={(e) => updateRow(index, 'account_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Account</option>
                                                        {accounts.map(acc => (
                                                            <option
                                                                key={acc.id}
                                                                value={acc.id}
                                                                disabled={!acc.parent_id}
                                                                className={!acc.parent_id ? "font-bold bg-gray-100 text-gray-800" : ""}
                                                            >
                                                                {acc.code} - {acc.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={errors[`details.${index}.account_id`]} className="mt-2" />
                                                </div>

                                                <div className="w-full md:w-40">
                                                    <InputLabel value="Debit" />
                                                    <TextInput
                                                        type="number"
                                                        step="0.01"
                                                        className="mt-1 block w-full"
                                                        value={detail.debit}
                                                        onChange={(e) => updateRow(index, 'debit', e.target.value)}
                                                        disabled={Number(detail.credit) > 0}
                                                        min="0"
                                                    />
                                                    <InputError message={errors[`details.${index}.debit`]} className="mt-2" />
                                                </div>

                                                <div className="w-full md:w-40">
                                                    <InputLabel value="Credit" />
                                                    <TextInput
                                                        type="number"
                                                        step="0.01"
                                                        className="mt-1 block w-full"
                                                        value={detail.credit}
                                                        onChange={(e) => updateRow(index, 'credit', e.target.value)}
                                                        disabled={Number(detail.debit) > 0}
                                                        min="0"
                                                    />
                                                    <InputError message={errors[`details.${index}.credit`]} className="mt-2" />
                                                </div>

                                                <div className="pt-7">
                                                    {data.details.length > 1 && (
                                                        <DangerButton type="button" onClick={() => removeRow(index)}>
                                                            Remove
                                                        </DangerButton>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={addRow}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            + Add Row
                                        </button>
                                    </div>

                                    {/* Totals Display */}
                                    <div className="mt-6 p-4 bg-gray-100 rounded flex justify-between items-center">
                            
                                        <div className="flex gap-8 font-mono font-bold">
                                            <div>Total Debit: {totalDebit.toFixed(2)}</div>
                                            <div>Total Credit: {totalCredit.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Save Transaction
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
