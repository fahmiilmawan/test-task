import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ transactions, accounts, filters = {} }) {
    const [queryParams, setQueryParams] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        account_id: filters.account_id || '',
    });

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            const params = Object.keys(queryParams).reduce((acc, key) => {
                if (queryParams[key]) acc[key] = queryParams[key];
                return acc;
            }, {});

            router.get(route('transaction.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [queryParams]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Transactions</h2>
                    <Link href={route('transaction.create')}>
                        <PrimaryButton>New Transaction</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* Filters */}
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                                <div className="flex-1">
                                    <select
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={queryParams.account_id}
                                        onChange={(e) => setQueryParams({ ...queryParams, account_id: e.target.value })}
                                    >
                                        <option value="">Filter by Account</option>
                                        {accounts && accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full md:w-48">
                                    <input
                                        type="date"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={queryParams.start_date}
                                        onChange={(e) => setQueryParams({ ...queryParams, start_date: e.target.value })}
                                        placeholder="Start Date"
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <input
                                        type="date"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={queryParams.end_date}
                                        onChange={(e) => setQueryParams({ ...queryParams, end_date: e.target.value })}
                                        placeholder="End Date"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.data.map((transaction) => {
                                            const totalDebit = transaction.details.reduce((sum, d) => sum + Number(d.debit), 0);
                                            const totalCredit = transaction.details.reduce((sum, d) => sum + Number(d.credit), 0);
                                            const netTotal = totalDebit - totalCredit;

                                            // Logic:
                                            // If Debit > Credit (netTotal > 0) -> Positive (Green)
                                            // If Credit > Debit (netTotal < 0) -> Negative (Red)
                                            // We display the absolute value but colored and signed accordingly

                                            let totalDisplayClass = "text-gray-900";
                                            if (netTotal > 0) {
                                                totalDisplayClass = "text-green-600 font-bold";
                                            } else if (netTotal < 0) {
                                                totalDisplayClass = "text-red-600 font-bold";
                                            }

                                            return (
                                                <tr key={transaction.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {transaction.description}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        <div className="flex flex-col gap-1">
                                                            {transaction.details.map(detail => (
                                                                <div key={detail.id} className="flex justify-between text-xs">
                                                                    <span>{detail.account.code} - {detail.account.name}</span>
                                                                    <span className="font-mono">
                                                                        {Number(detail.debit) > 0 ? `${Number(detail.debit).toFixed(2)}` : `${Number(detail.credit).toFixed(2)}`}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${totalDisplayClass}`}>
                                                        {netTotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {transactions.data.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {transactions.links && transactions.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex items-center justify-center gap-1">
                                        {transactions.links.map((link, key) => (
                                            link.url ? (
                                                <Link
                                                    key={key}
                                                    href={link.url}
                                                    className={`px-3 py-1 text-sm rounded ${link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                        }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={key}
                                                    className="px-3 py-1 text-sm text-gray-400 border border-gray-300 rounded bg-gray-50"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
