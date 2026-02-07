import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import AccountForm from './Partials/AccountForm';

export default function Edit({ account, parents }) {
    const isParent = !account.parent_id;
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Account
                </h2>
            }
        >
            <Head title="Edit Account" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <AccountForm
                                account={account}
                                parents={parents}
                                submitRoute={route('account.update', account.id)}
                                method="put"
                                title={`Edit Account: ${account.code} - ${account.name}`}
                                buttonText="Update Account"
                                mode={isParent ? 'parent-update' : 'child-update'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
