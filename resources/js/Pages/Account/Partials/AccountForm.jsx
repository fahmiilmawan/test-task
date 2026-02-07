import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Link, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function AccountForm({ account, parents, submitRoute, method = 'post', title, buttonText, parentContext, mode }) {
    // Modes: 'child-create', 'parent-update', 'child-update'

    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm({
        code: account?.code || '',
        name: account?.name || '',
        type: account?.type || (parentContext ? parentContext.type : ''),
        parent_id: account?.parent_id || (parentContext ? parentContext.id : ''),
        is_active: account ? Boolean(account.is_active) : true,
    });

    const isChildCreation = mode === 'child-create';
    const isParentUpdate = mode === 'parent-update';
    const isChildUpdate = mode === 'child-update';

    const submit = (e) => {
        e.preventDefault();
        if (method === 'put') {
            put(submitRoute);
        } else {
            post(submitRoute);
        }
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {account ? "Update the account details." : "Create a new account."}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">

                {/* Update Mode: Code (Readonly for Parent, Editable for Child) */}
                {(isParentUpdate || isChildUpdate) && (
                    <div>
                        <InputLabel htmlFor="code" value="Code" />
                        <TextInput
                            id="code"
                            className={`mt-1 block w-full ${isParentUpdate ? 'bg-gray-100' : ''}`}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            disabled={isParentUpdate}
                            required={isChildUpdate}
                        />
                        <InputError className="mt-2" message={errors.code} />
                    </div>
                )}

                {/* All Modes: Name */}
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Parent Update: Type (Editable? Requirement says "Update Page (Parent) column: type") */}
                {/* Child Create: Type (Hidden, inferred) */}
                {/* Child Update: Type (Hidden) */}
                {(isParentUpdate) && (
                    <div>
                        <InputLabel htmlFor="type" value="Type" />
                        <select
                            id="type"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="revenue">Revenue</option>
                            <option value="expense">Expense</option>
                        </select>
                        <InputError className="mt-2" message={errors.type} />
                    </div>
                )}

                {/* Parent Update: Is Active */}
                {/* Child Create: Is Active (Hidden, default true?) Requirement says "Create Page (Child) column: just name" */}
                {/* Child Update: Is Active (Hidden? Requirement says "Update Page (Child) column: name") */}
                {(isParentUpdate) && (
                    <div className="block">
                        <label className="flex items-center">
                            <Checkbox
                                name="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600">Is Active</span>
                        </label>
                        <InputError className="mt-2" message={errors.is_active} />
                    </div>
                )}

                {/* Hidden Fields for Child Create/Update to ensure data integrity if needed */}
                {/* Note: Inertia sends initial data if not changed, but explicit hidden inputs aren't needed with useForm unless we want to render them for debugging.
                    However, we must ensure 'type' and 'parent_id' are in 'data' state. They are initialized in useForm.
                */}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {buttonText}
                    </PrimaryButton>
                    <Link
                        href={route('account.index')}
                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </Link>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
