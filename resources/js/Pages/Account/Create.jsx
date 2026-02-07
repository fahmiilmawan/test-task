import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import AccountForm from './Partials/AccountForm';

export default function Create({ parents, parent_context }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {parent_context ? `Create Child Account` : 'Create Account'}
                </h2>
            }
        >
            <Head title="Create Account" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <AccountForm
                                parents={parents}
                                parentContext={parent_context}
                                submitRoute={route('account.store')}
                                title={parent_context ? `New Child Account under ${parent_context.name}` : "Create New Account"}
                                buttonText="Create Account"
                                mode="child-create"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
