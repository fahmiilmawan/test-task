<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Services\AccountService;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Account::query()->whereNull('parent_id');

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $accounts = $query->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Account/Index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Enforce parent context for creation (Child only)
        if (!$request->has('parent_id')) {
            return redirect()->route('account.index')->with('error', 'You can only create child accounts.');
        }

        $parent = Account::findOrFail($request->parent_id);

        return Inertia::render('Account/Create', [
            'parents' => Account::orderBy('code')->get(['id', 'code', 'name']),
            'parent_context' => $parent,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAccountRequest $request)
    {
        $validated = $request->validated();

        // Ensure type is consistent with parent (though frontend should send it)
        // Double check if type is missing or mismatched if we want to be strict,
        // but validation handles 'required'.
        // Code generation:
        $validated['code'] = $this->accountService->generateCode($validated['type']);

        Account::create($validated);

        // Always redirect to parent's child index
        return redirect()->route('account.show', $validated['parent_id'])->with('success', 'Child account created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Account $account)
    {
        $query = Account::query()->where('parent_id', $account->id);

        if ($request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $children = $query->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Account/ChildIndex', [
            'parent' => $account,
            'accounts' => $children,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account)
    {
        return Inertia::render('Account/Edit', [
            'account' => $account,
            'parents' => Account::where('id', '!=', $account->id)
                ->orderBy('code')
                ->get(['id', 'code', 'name'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAccountRequest $request, Account $account)
    {
        // Prevent code regeneration on update, even if type changes (per requirement 4)
        $validated = $request->validated();

        $account->update($validated);

        if ($account->parent_id) {
            return redirect()->route('account.show', $account->parent_id)->with('success', 'Account updated successfully.');
        }

        return redirect()->route('account.index')->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        $parentId = $account->parent_id;
        $account->delete();

        if ($parentId) {
            return redirect()->route('account.show', $parentId)->with('success', 'Account deleted successfully.');
        }

        return redirect()->route('account.index')->with('success', 'Account deleted successfully.');
    }
}
