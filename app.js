// ========== DATA STORAGE ==========
let data = {
    wallets: [],
    categories: { income: [], expense: [] },
    transactions: [],
    transfers: [],
    debts: [],
    habitQuestions: [],
    habitRecords: []
};

// Privacy mode state
let hideAmounts = false;

// Load from localStorage
function loadData() {
    const saved = localStorage.getItem('finhabitData');
    if (saved) {
        data = JSON.parse(saved);
    } else {
        // Initialize default data
        data.wallets = [
            { id: Date.now(), name: 'Cash', balance: 0 },
            { id: Date.now() + 1, name: 'Rekening BCA', balance: 0 }
        ];
        data.categories.income = ['Gaji', 'Bonus', 'Lain-lain'];
        data.categories.expense = ['Makan', 'Transport', 'Belanja', 'Hiburan', 'Lain-lain'];
        saveData();
    }
}

// Save to localStorage
function saveData() {
    localStorage.setItem('finhabitData', JSON.stringify(data));
}

// ========== NAVIGATION ==========
function showMainTab(tabName) {
    document.querySelectorAll('.main-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName + '-main').classList.add('active');
    event.target.classList.add('active');
    
    // Show/hide FAB (only for finance, not finance2)
    document.getElementById('fab-btn').style.display = tabName === 'finance' ? 'flex' : 'none';
    
    // Render charts if grafik tab
    if (tabName === 'finance') {
        setTimeout(renderCharts, 100);
    } else if (tabName === 'finance2') {
        renderFinance2();
        setTimeout(renderChartsF2, 100);
    }
}

function showSubTab(mainTab, subTab) {
    const prefix = mainTab + '-';
    document.querySelectorAll(`#${mainTab}-main .sub-tab-content`).forEach(t => t.classList.remove('active'));
    document.querySelectorAll(`#${mainTab}-main .sub-tab-btn`).forEach(b => b.classList.remove('active'));
    document.getElementById(prefix + subTab).classList.add('active');
    event.target.classList.add('active');
    
    // Render charts when grafik tab shown
    if (subTab === 'grafik') {
        setTimeout(renderCharts, 100);
    }
}

// ========== MODAL ==========
function openActionMenu() {
    document.getElementById('modal').classList.add('active');
    document.getElementById('action-menu').style.display = 'block';
    document.querySelectorAll('.modal-form').forEach(f => f.classList.remove('active'));
}

function closeActionMenu() {
    document.getElementById('modal').classList.remove('active');
}

function closeModal(e) {
    if (e.target.id === 'modal') closeActionMenu();
}

function showForm(type) {
    document.getElementById('action-menu').style.display = 'none';
    document.getElementById('form-' + type).classList.add('active');
    
    // Populate dropdowns
    populateWalletDropdowns();
    populateCategoryDropdowns();
    
    // Toggle debt wallet visibility if debt form
    if (type === 'debt') {
        toggleDebtWallet();
    }
}

function backToMenu() {
    document.querySelectorAll('.modal-form').forEach(f => f.classList.remove('active'));
    document.getElementById('action-menu').style.display = 'block';
}

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(amount) {
    if (hideAmounts) {
        return 'Rp ***';
    }
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getTime() {
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

// ========== WALLET MANAGEMENT ==========
function populateWalletDropdowns() {
    const selects = [
        'income-wallet', 'expense-wallet', 'debt-wallet',
        'transfer-from', 'transfer-to'
    ];
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = data.wallets.map(w => 
                `<option value="${w.id}">${w.name}</option>`
            ).join('');
        }
    });
}

function populateCategoryDropdowns() {
    const incomeSelect = document.getElementById('income-category');
    const expenseSelect = document.getElementById('expense-category');
    
    if (incomeSelect) {
        incomeSelect.innerHTML = data.categories.income.map(c => 
            `<option value="${c}">${c}</option>`
        ).join('');
    }
    
    if (expenseSelect) {
        expenseSelect.innerHTML = data.categories.expense.map(c => 
            `<option value="${c}">${c}</option>`
        ).join('');
    }
    
    // Populate category filter in Finance Resume tab
    const categoryFilter = document.getElementById('finance-category-filter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';
        
        // Add income categories
        data.categories.income.forEach(c => {
            categoryFilter.innerHTML += `<option value="income-${c}">💵 ${c}</option>`;
        });
        
        // Add expense categories
        data.categories.expense.forEach(c => {
            categoryFilter.innerHTML += `<option value="expense-${c}">💸 ${c}</option>`;
        });
    }
    
    // Populate category filter in Finance 2 Resume tab
    const categoryFilter2 = document.getElementById('finance2-category-filter');
    if (categoryFilter2) {
        categoryFilter2.innerHTML = '<option value="all">Semua Kategori</option>';
        
        // Add income categories
        data.categories.income.forEach(c => {
            categoryFilter2.innerHTML += `<option value="income-${c}">💵 ${c}</option>`;
        });
        
        // Add expense categories
        data.categories.expense.forEach(c => {
            categoryFilter2.innerHTML += `<option value="expense-${c}">💸 ${c}</option>`;
        });
    }
}

// Toggle debt wallet visibility
function toggleDebtWallet() {
    const debtType = document.getElementById('debt-type').value;
    const walletGroup = document.getElementById('debt-wallet-group');
    
    if (debtType === 'piutang') {
        walletGroup.style.display = 'block';
    } else {
        walletGroup.style.display = 'none';
    }
}

function renderWalletList() {
    const container = document.getElementById('wallet-list');
    if (!container) return;
    
    if (data.wallets.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💼</div><h3>Belum Ada Dompet</h3></div>';
        return;
    }
    
    container.innerHTML = data.wallets.map(w => `
        <div class="list-item">
            <div class="list-item-header">
                <span>${w.name}</span>
                <span>${formatCurrency(w.balance)}</span>
            </div>
            <button onclick="deleteWallet(${w.id})">🗑️ Hapus</button>
        </div>
    `).join('');
}

function deleteWallet(id) {
    if (confirm('Yakin hapus dompet ini?')) {
        data.wallets = data.wallets.filter(w => w.id !== id);
        saveData();
        renderWalletList();
        renderSaldoTab();
        updateDashboard();
    }
}

document.getElementById('wallet-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('wallet-name').value;
    const balance = parseFloat(document.getElementById('wallet-balance').value);
    
    data.wallets.push({
        id: Date.now(),
        name: name,
        balance: balance
    });
    
    saveData();
    this.reset();
    renderWalletList();
    renderSaldoTab();
    updateDashboard();
    alert('✅ Dompet berhasil ditambahkan!');
});

// ========== SALDO TAB - BALANCE PER WALLET ==========
function renderSaldoTab() {
    const walletBalanceContainer = document.getElementById('wallet-balance-list');
    const walletDetailContainer = document.getElementById('wallet-detail-section');
    
    if (!walletBalanceContainer || !walletDetailContainer) return;
    
    // Render wallet balance cards
    if (data.wallets.length === 0) {
        walletBalanceContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💼</div><h3>Belum Ada Dompet</h3><p>Tambahkan dompet di tab Pengaturan</p></div>';
        walletDetailContainer.innerHTML = '';
        return;
    }
    
    walletBalanceContainer.innerHTML = data.wallets.map(w => {
        const isPositive = w.balance >= 0;
        const balanceColor = isPositive ? '#4CAF50' : '#f44336';
        
        return `
            <div class="resume-card ${isPositive ? 'income' : 'expense'}">
                <div class="resume-card-label">${w.name}</div>
                <div class="resume-card-amount" style="color: ${balanceColor};">
                    ${formatCurrency(w.balance)}
                </div>
            </div>
        `;
    }).join('');
    
    // Render transaction details per wallet
    walletDetailContainer.innerHTML = data.wallets.map(wallet => {
        // Get transactions for this wallet
        const walletTransactions = data.transactions.filter(t => t.walletId === wallet.id);
        const walletTransfers = data.transfers.filter(t => t.fromId === wallet.id || t.toId === wallet.id);
        
        // Calculate totals
        const income = walletTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = walletTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        // Transfer in/out
        const transferIn = walletTransfers.filter(t => t.toId === wallet.id).reduce((sum, t) => sum + t.amount, 0);
        const transferOut = walletTransfers.filter(t => t.fromId === wallet.id).reduce((sum, t) => sum + (t.amount + t.fee), 0);
        
        const totalCount = walletTransactions.length + walletTransfers.length;
        
        return `
            <div class="setting-section">
                <h4>💼 ${wallet.name} - ${formatCurrency(wallet.balance)}</h4>
                
                <div class="resume-grid" style="margin-bottom: 15px;">
                    <div class="resume-card income">
                        <div class="resume-card-label">💵 Total Pemasukan</div>
                        <div class="resume-card-amount">${formatCurrency(income)}</div>
                    </div>
                    <div class="resume-card expense">
                        <div class="resume-card-label">💸 Total Pengeluaran</div>
                        <div class="resume-card-amount">${formatCurrency(expense)}</div>
                    </div>
                    <div class="resume-card balance">
                        <div class="resume-card-label">🔄 Transfer Masuk</div>
                        <div class="resume-card-amount">${formatCurrency(transferIn)}</div>
                    </div>
                    <div class="resume-card expense">
                        <div class="resume-card-label">🔄 Transfer Keluar</div>
                        <div class="resume-card-amount">${formatCurrency(transferOut)}</div>
                    </div>
                </div>
                
                ${totalCount > 0 ? `
                    <details>
                        <summary style="cursor: pointer; padding: 10px; background: #f8f9fa; border-radius: 8px; font-weight: 600; margin-bottom: 10px;">
                            📋 Lihat Detail Transaksi (${totalCount})
                        </summary>
                        <div class="list" style="max-height: 300px;">
                            ${walletTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(t => {
                                const typeClass = t.type === 'expense' ? 'expense' : '';
                                const sign = t.type === 'expense' ? '-' : '+';
                                
                                return `
                                    <div class="list-item ${typeClass}">
                                        <div class="list-item-header">
                                            <span>${t.category}</span>
                                            <span class="list-item-amount">${sign} ${formatCurrency(t.amount)}</span>
                                        </div>
                                        <div class="list-item-detail">
                                            ${t.date} ${t.note ? '• ' + t.note : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            ${walletTransactions.length > 10 ? `<div style="text-align: center; padding: 10px; color: #666;">... dan ${walletTransactions.length - 10} transaksi lainnya</div>` : ''}
                        </div>
                    </details>
                ` : '<p style="color: #999; text-align: center; padding: 20px;">Belum ada transaksi</p>'}
            </div>
        `;
    }).join('');
}

// ========== CATEGORY MANAGEMENT ==========
function renderCategoryLists() {
    const incomeContainer = document.getElementById('income-category-list');
    const expenseContainer = document.getElementById('expense-category-list');
    
    if (incomeContainer) {
        incomeContainer.innerHTML = data.categories.income.map(c => `
            <div class="list-item">
                <div class="list-item-header">
                    <span>${c}</span>
                    <button onclick="deleteCategory('income', '${c}')">🗑️ Hapus</button>
                </div>
            </div>
        `).join('');
    }
    
    if (expenseContainer) {
        expenseContainer.innerHTML = data.categories.expense.map(c => `
            <div class="list-item expense">
                <div class="list-item-header">
                    <span>${c}</span>
                    <button onclick="deleteCategory('expense', '${c}')">🗑️ Hapus</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update category dropdowns (including filter)
    populateCategoryDropdowns();
}

function deleteCategory(type, name) {
    if (confirm('Yakin hapus kategori ini?')) {
        data.categories[type] = data.categories[type].filter(c => c !== name);
        saveData();
        renderCategoryLists();
    }
}

document.getElementById('income-category-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('income-category-name').value;
    if (!data.categories.income.includes(name)) {
        data.categories.income.push(name);
        saveData();
        this.reset();
        renderCategoryLists();
        alert('✅ Kategori berhasil ditambahkan!');
    } else {
        alert('❌ Kategori sudah ada!');
    }
});

document.getElementById('expense-category-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('expense-category-name').value;
    if (!data.categories.expense.includes(name)) {
        data.categories.expense.push(name);
        saveData();
        this.reset();
        renderCategoryLists();
        alert('✅ Kategori berhasil ditambahkan!');
    } else {
        alert('❌ Kategori sudah ada!');
    }
});
// ========== TRANSACTIONS ==========
document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('income-date').value;
    const category = document.getElementById('income-category').value;
    const walletId = parseInt(document.getElementById('income-wallet').value);
    const amount = parseFloat(document.getElementById('income-amount').value);
    const note = document.getElementById('income-note').value;
    
    // Add transaction
    data.transactions.unshift({
        id: Date.now(),
        type: 'income',
        date: date,
        category: category,
        walletId: walletId,
        amount: amount,
        note: note
    });
    
    // Update wallet balance
    const wallet = data.wallets.find(w => w.id === walletId);
    if (wallet) wallet.balance += amount;
    
    saveData();
    this.reset();
    closeActionMenu();
    renderTransactionList();
    renderSaldoTab();
    updateDashboard();
    alert('✅ Pemasukan berhasil ditambahkan!');
});

document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const walletId = parseInt(document.getElementById('expense-wallet').value);
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const note = document.getElementById('expense-note').value;
    
    data.transactions.unshift({
        id: Date.now(),
        type: 'expense',
        date: date,
        category: category,
        walletId: walletId,
        amount: amount,
        note: note
    });
    
    const wallet = data.wallets.find(w => w.id === walletId);
    if (wallet) wallet.balance -= amount;
    
    saveData();
    this.reset();
    closeActionMenu();
    renderTransactionList();
    renderSaldoTab();
    updateDashboard();
    alert('✅ Pengeluaran berhasil ditambahkan!');
});

document.getElementById('transfer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('transfer-date').value;
    const fromId = parseInt(document.getElementById('transfer-from').value);
    const toId = parseInt(document.getElementById('transfer-to').value);
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const fee = parseFloat(document.getElementById('transfer-fee').value) || 0;
    const note = document.getElementById('transfer-note').value;
    
    if (fromId === toId) {
        alert('❌ Tidak bisa transfer ke dompet yang sama!');
        return;
    }
    
    data.transfers.unshift({
        id: Date.now(),
        date: date,
        fromId: fromId,
        toId: toId,
        amount: amount,
        fee: fee,
        note: note
    });
    
    const fromWallet = data.wallets.find(w => w.id === fromId);
    const toWallet = data.wallets.find(w => w.id === toId);
    
    if (fromWallet) fromWallet.balance -= (amount + fee);
    if (toWallet) toWallet.balance += amount;
    
    saveData();
    this.reset();
    closeActionMenu();
    renderSaldoTab();
    updateDashboard();
    alert('✅ Transfer berhasil!');
});

function renderTransactionList() {
    const container = document.getElementById('transaction-list');
    if (!container) return;
    
    const filteredTrans = filterTransactionsByPeriod();
    
    if (filteredTrans.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Belum Ada Transaksi</h3></div>';
        return;
    }
    
    container.innerHTML = filteredTrans.map(t => {
        const wallet = data.wallets.find(w => w.id === t.walletId);
        const walletName = wallet ? wallet.name : 'Unknown';
        const typeClass = t.type === 'expense' ? 'expense' : '';
        const sign = t.type === 'expense' ? '-' : '+';
        
        return `
            <div class="list-item ${typeClass}">
                <div class="list-item-header">
                    <span>${t.category}</span>
                    <span class="list-item-amount">${sign} ${formatCurrency(t.amount)}</span>
                </div>
                <div class="list-item-detail">
                    ${t.date} • ${walletName} ${t.note ? '• ' + t.note : ''}
                </div>
                <button onclick="deleteTransaction(${t.id})">🗑️ Hapus</button>
            </div>
        `;
    }).join('');
    
    updateResumeSummary();
}

function deleteTransaction(id) {
    if (confirm('Yakin hapus transaksi ini?')) {
        const trans = data.transactions.find(t => t.id === id);
        if (trans) {
            const wallet = data.wallets.find(w => w.id === trans.walletId);
            if (wallet) {
                if (trans.type === 'income') {
                    wallet.balance -= trans.amount;
                } else {
                    wallet.balance += trans.amount;
                }
            }
        }
        
        data.transactions = data.transactions.filter(t => t.id !== id);
        saveData();
        renderTransactionList();
        renderSaldoTab();
        updateDashboard();
    }
}

function filterTransactionsByPeriod() {
    const period = document.getElementById('finance-period').value;
    const categoryFilter = document.getElementById('finance-category-filter').value;
    const today = new Date();
    
    let filtered = [];
    
    // Filter by period
    if (period === 'all') {
        filtered = data.transactions;
    } else if (period === 'month') {
        const year = today.getFullYear();
        const month = today.getMonth();
        filtered = data.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
    } else if (period === 'custom') {
        const start = document.getElementById('finance-start').value;
        const end = document.getElementById('finance-end').value;
        if (!start || !end) {
            filtered = data.transactions;
        } else {
            filtered = data.transactions.filter(t => t.date >= start && t.date <= end);
        }
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        const [type, category] = categoryFilter.split('-');
        if (type && category) {
            filtered = filtered.filter(t => t.type === type && t.category === category);
        }
    }
    
    return filtered;
}

function filterFinanceTransactions() {
    renderTransactionList();
}

document.getElementById('finance-period').addEventListener('change', function() {
    const isCustom = this.value === 'custom';
    document.getElementById('finance-start').style.display = isCustom ? 'block' : 'none';
    document.getElementById('finance-end').style.display = isCustom ? 'block' : 'none';
});

function updateResumeSummary() {
    const filtered = filterTransactionsByPeriod();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    
    document.getElementById('resume-income').textContent = formatCurrency(income);
    document.getElementById('resume-expense').textContent = formatCurrency(expense);
    document.getElementById('resume-balance').textContent = (balance >= 0 ? '+ ' : '- ') + formatCurrency(Math.abs(balance));
}

// ========== DEBTS ==========
document.getElementById('debt-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('debt-type').value;
    const person = document.getElementById('debt-person').value;
    const amount = parseFloat(document.getElementById('debt-amount').value);
    const note = document.getElementById('debt-note').value;
    
    let walletId = null;
    
    // For piutang (menghutangi), money goes out immediately
    if (type === 'piutang') {
        walletId = parseInt(document.getElementById('debt-wallet').value);
        
        // Deduct from wallet
        const wallet = data.wallets.find(w => w.id === walletId);
        if (wallet) {
            wallet.balance -= amount;
        }
    }
    // For hutang (berhutang), no wallet yet - will be set when paid
    
    data.debts.unshift({
        id: Date.now(),
        type: type,
        person: person,
        amount: amount,
        originalAmount: amount,
        walletId: walletId, // For piutang: where money went out
        note: note,
        paid: false,
        paidAmount: 0,
        paidWalletId: null,
        paidDate: null,
        createdDate: getToday()
    });
    
    saveData();
    this.reset();
    document.getElementById('debt-wallet-group').style.display = 'none';
    closeActionMenu();
    renderDebtList();
    renderSaldoTab();
    updateDashboard();
    alert('✅ Hutang/Piutang berhasil ditambahkan!');
});

function renderDebtList() {
    const container = document.getElementById('debt-list');
    if (!container) return;
    
    const unpaidDebts = data.debts.filter(d => !d.paid);
    
    if (unpaidDebts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤝</div><h3>Belum Ada Hutang/Piutang</h3></div>';
        return;
    }
    
    container.innerHTML = unpaidDebts.map(d => {
        const label = d.type === 'hutang' ? 'Hutang ke' : 'Piutang dari';
        const remaining = d.amount - (d.paidAmount || 0);
        const paidInfo = d.paidAmount > 0 ? `<br>Sudah dibayar: ${formatCurrency(d.paidAmount)}` : '';
        
        // Wallet info
        let walletInfo = '';
        if (d.type === 'piutang' && d.walletId) {
            const wallet = data.wallets.find(w => w.id === d.walletId);
            if (wallet) walletInfo = `Dari: ${wallet.name} • `;
        }
        
        return `
            <div class="list-item debt">
                <div class="list-item-header">
                    <span>${label} ${d.person}</span>
                    <span class="list-item-amount" style="color: #ff9800;">${formatCurrency(remaining)}</span>
                </div>
                <div class="list-item-detail">
                    ${walletInfo}${d.note || 'Tidak ada catatan'}${paidInfo}
                </div>
                <button class="btn-success" onclick="payDebt(${d.id})">✅ Lunasi</button>
                <button onclick="deleteDebt(${d.id})">🗑️ Hapus</button>
            </div>
        `;
    }).join('');
    
    updateDebtSummary();
}

function payDebt(id) {
    const debt = data.debts.find(d => d.id === id);
    if (!debt) return;
    
    // Store current debt ID for submission
    window.currentPayingDebtId = id;
    
    // Open modal
    document.getElementById('pay-debt-modal').classList.add('active');
    
    // Set title
    const title = debt.type === 'hutang' ? 'Bayar Hutang' : 'Terima Pelunasan Piutang';
    document.getElementById('pay-debt-title').textContent = `💰 ${title}`;
    
    // Set amount label
    const amountLabel = debt.type === 'hutang' 
        ? 'Nominal yang Dibayar (Rp)' 
        : 'Nominal yang Diterima (Rp)';
    document.getElementById('pay-amount-label').textContent = amountLabel;
    
    // Set wallet label
    const walletLabel = debt.type === 'hutang'
        ? 'Bayar dari Dompet'
        : 'Terima ke Dompet';
    document.getElementById('pay-wallet-label').textContent = walletLabel;
    
    // Set default amount (remaining)
    const remaining = debt.amount - (debt.paidAmount || 0);
    document.getElementById('pay-amount').value = remaining;
    document.getElementById('pay-remaining').textContent = `Sisa: ${formatCurrency(remaining)}`;
    
    // Set today's date
    document.getElementById('pay-date').value = getToday();
    
    // Populate wallet dropdown
    const walletSelect = document.getElementById('pay-wallet');
    walletSelect.innerHTML = data.wallets.map(w => 
        `<option value="${w.id}">${w.name}</option>`
    ).join('');
}

function closePayDebtModal(e) {
    if (e && e.target.id !== 'pay-debt-modal') return;
    document.getElementById('pay-debt-modal').classList.remove('active');
    document.getElementById('pay-debt-form').reset();
}

// Submit payment
document.getElementById('pay-debt-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const debtId = window.currentPayingDebtId;
    const debt = data.debts.find(d => d.id === debtId);
    if (!debt) return;
    
    const paidAmount = parseFloat(document.getElementById('pay-amount').value);
    const paidWalletId = parseInt(document.getElementById('pay-wallet').value);
    const paidDate = document.getElementById('pay-date').value;
    
    // Validate amount
    const remaining = debt.amount - (debt.paidAmount || 0);
    if (paidAmount > remaining) {
        alert('❌ Nominal tidak boleh lebih dari sisa hutang/piutang!');
        return;
    }
    
    // Update debt
    debt.paidAmount = (debt.paidAmount || 0) + paidAmount;
    debt.paidWalletId = paidWalletId;
    debt.paidDate = paidDate;
    
    // Check if fully paid
    if (debt.paidAmount >= debt.amount) {
        debt.paid = true;
    }
    
    // Update wallet balance
    const wallet = data.wallets.find(w => w.id === paidWalletId);
    if (wallet) {
        if (debt.type === 'hutang') {
            // Paying debt: money goes out
            wallet.balance -= paidAmount;
        } else {
            // Receiving payment: money comes in
            wallet.balance += paidAmount;
        }
    }
    
    saveData();
    closePayDebtModal();
    renderDebtList();
    renderSaldoTab();
    updateDashboard();
    
    const statusMsg = debt.paid ? 'Lunas!' : `Cicilan ${formatCurrency(paidAmount)} berhasil!`;
    alert(`✅ ${statusMsg}`);
});

function deleteDebt(id) {
    if (confirm('Yakin hapus hutang/piutang ini?')) {
        data.debts = data.debts.filter(d => d.id !== id);
        saveData();
        renderDebtList();
        renderSaldoTab();
        updateDashboard();
    }
}

function updateDebtSummary() {
    const unpaidDebts = data.debts.filter(d => !d.paid);
    const hutang = unpaidDebts.filter(d => d.type === 'hutang').reduce((sum, d) => sum + d.amount, 0);
    const piutang = unpaidDebts.filter(d => d.type === 'piutang').reduce((sum, d) => sum + d.amount, 0);
    const balance = piutang - hutang;
    
    document.getElementById('debt-total').textContent = formatCurrency(hutang);
    document.getElementById('receivable-total').textContent = formatCurrency(piutang);
    document.getElementById('debt-balance').textContent = (balance >= 0 ? '+ ' : '- ') + formatCurrency(Math.abs(balance));
}

// ========== DASHBOARD ==========
function updateDashboard() {
    // Total balance
    const totalBalance = data.wallets.reduce((sum, w) => sum + w.balance, 0);
    document.getElementById('total-balance').textContent = formatCurrency(totalBalance);
    
    // Debt & Receivable
    const unpaidDebts = data.debts.filter(d => !d.paid);
    const totalDebt = unpaidDebts.filter(d => d.type === 'hutang').reduce((sum, d) => sum + d.amount, 0);
    const totalReceivable = unpaidDebts.filter(d => d.type === 'piutang').reduce((sum, d) => sum + d.amount, 0);
    
    document.getElementById('total-debt').textContent = '- ' + formatCurrency(totalDebt);
    document.getElementById('total-receivable').textContent = '- ' + formatCurrency(totalReceivable);
}
// ========== CHARTS ==========
let charts = { expense: null, income: null, trend: null };

function renderCharts() {
    // Expense Pie Chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        const expenseByCategory = {};
        data.transactions.filter(t => t.type === 'expense').forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        });
        
        if (charts.expense) charts.expense.destroy();
        charts.expense = new Chart(expenseCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(expenseByCategory),
                datasets: [{
                    data: Object.values(expenseByCategory),
                    backgroundColor: ['#f44336', '#ff9800', '#ffc107', '#ff5722', '#e91e63']
                }]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { position: 'bottom' },
                    title: { 
                        display: true, 
                        text: hideAmounts ? 'Pengeluaran per Kategori (Hidden)' : 'Pengeluaran per Kategori' 
                    },
                    tooltip: { enabled: !hideAmounts }
                }
            }
        });
    }
    
    // Income Bar Chart
    const incomeCtx = document.getElementById('incomeChart');
    if (incomeCtx) {
        const incomeByCategory = {};
        data.transactions.filter(t => t.type === 'income').forEach(t => {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        });
        
        if (charts.income) charts.income.destroy();
        charts.income = new Chart(incomeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(incomeByCategory),
                datasets: [{
                    label: hideAmounts ? 'Hidden' : 'Pemasukan (Rp)',
                    data: Object.values(incomeByCategory),
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { display: false },
                    title: { 
                        display: true, 
                        text: hideAmounts ? 'Pemasukan per Kategori (Hidden)' : 'Pemasukan per Kategori' 
                    },
                    tooltip: { enabled: !hideAmounts }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { display: !hideAmounts }
                    }
                }
            }
        });
    }
    
    // Trend Line Chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthIncome = data.transactions.filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'income' && tDate.getFullYear() === year && tDate.getMonth() === month;
            }).reduce((sum, t) => sum + t.amount, 0);
            
            const monthExpense = data.transactions.filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && tDate.getFullYear() === year && tDate.getMonth() === month;
            }).reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
        }
        
        if (charts.trend) charts.trend.destroy();
        charts.trend = new Chart(trendCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: hideAmounts ? 'Hidden' : 'Pemasukan',
                    data: incomeData,
                    borderColor: '#4CAF50',
                    tension: 0.4
                }, {
                    label: hideAmounts ? 'Hidden' : 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#f44336',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { position: 'bottom' },
                    title: { 
                        display: true, 
                        text: hideAmounts ? 'Trend 6 Bulan (Hidden)' : 'Trend 6 Bulan Terakhir' 
                    },
                    tooltip: { enabled: !hideAmounts }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { display: !hideAmounts }
                    }
                }
            }
        });
    }
}

// ========== HABIT TRACKING - PROGRESSIVE CHECK-IN ==========
function toggleQuestionType() {
    const type = document.getElementById('question-type').value;
    document.getElementById('options-section').style.display = type === 'multiple' ? 'block' : 'none';
}

function addOption() {
    const builder = document.getElementById('options-builder');
    const optionItem = document.createElement('div');
    optionItem.className = 'option-item';
    optionItem.innerHTML = `
        <input type="text" placeholder="Contoh: Baik" class="option-label" autocomplete="off">
        <input type="number" placeholder="Skor" class="option-score" value="4" min="0" max="100" autocomplete="off">
        <button type="button" onclick="removeOption(this)" title="Hapus">✕</button>
    `;
    builder.appendChild(optionItem);
}

function removeOption(btn) {
    const builder = document.getElementById('options-builder');
    if (builder.children.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Minimal harus ada 1 opsi!');
    }
}

document.getElementById('question-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const questionText = document.getElementById('question-text').value;
    const questionType = document.getElementById('question-type').value;
    let options = null;
    
    if (questionType === 'multiple') {
        options = [];
        const optionItems = document.querySelectorAll('#options-builder .option-item');
        
        optionItems.forEach(item => {
            const label = item.querySelector('.option-label').value.trim();
            const score = parseInt(item.querySelector('.option-score').value);
            
            if (label && !isNaN(score)) {
                options.push({ label, score });
            }
        });
        
        if (options.length === 0) {
            alert('Tambahkan minimal 1 opsi pilihan ganda!');
            return;
        }
    }
    
    data.habitQuestions.push({
        id: Date.now(),
        question: questionText,
        type: questionType,
        options: options
    });
    
    saveData();
    this.reset();
    document.getElementById('options-section').style.display = 'none';
    document.getElementById('options-builder').innerHTML = `
        <div class="option-item">
            <input type="text" placeholder="Contoh: Sangat Baik" class="option-label" autocomplete="off">
            <input type="number" placeholder="Skor" class="option-score" value="5" min="0" max="100" autocomplete="off">
            <button type="button" onclick="removeOption(this)" title="Hapus">✕</button>
        </div>
    `;
    
    renderQuestionsList();
    renderCheckinForm();
    alert('✅ Pertanyaan berhasil ditambahkan!');
});

function renderQuestionsList() {
    const container = document.getElementById('questions-list');
    if (!container) return;
    
    if (data.habitQuestions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><h3>Belum Ada Pertanyaan</h3></div>';
        return;
    }
    
    container.innerHTML = data.habitQuestions.map((q, idx) => `
        <div class="question-card">
            <div class="question-card-header">
                <div class="question-card-title">${idx + 1}. ${q.question}</div>
            </div>
            <div class="question-card-detail">
                Tipe: ${q.type === 'text' ? 'Isian Singkat' : 'Pilihan Ganda'}
                ${q.options ? '<br>Opsi: ' + q.options.map(o => `${o.label} (${o.score} poin)`).join(', ') : ''}
            </div>
            <button onclick="deleteQuestion(${q.id})">🗑️ Hapus</button>
        </div>
    `).join('');
}

function deleteQuestion(id) {
    if (confirm('Yakin hapus pertanyaan ini?')) {
        data.habitQuestions = data.habitQuestions.filter(q => q.id !== id);
        saveData();
        renderQuestionsList();
        renderCheckinForm();
    }
}

// PROGRESSIVE CHECK-IN (Per Question)
function renderCheckinForm() {
    const container = document.getElementById('checkin-container');
    if (!container) return;
    
    const today = getToday();
    
    if (data.habitQuestions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><h3>Belum Ada Pertanyaan</h3><p>Buat pertanyaan di tab Pengaturan</p></div>';
        return;
    }
    
    // Get already answered questions today
    const answeredToday = data.habitRecords.filter(r => r.date === today).map(r => r.questionId);
    
    // Get unanswered questions
    const unanswered = data.habitQuestions.filter(q => !answeredToday.includes(q.id));
    
    if (unanswered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><h3>Semua Pertanyaan Sudah Dijawab!</h3><p>Kembali lagi besok! 🎉</p></div>';
        return;
    }
    
    // Render each question with individual submit
    container.innerHTML = unanswered.map((q, idx) => {
        let inputHTML = '';
        
        if (q.type === 'text') {
            inputHTML = `<input type="text" id="answer-${q.id}" placeholder="Tulis jawabanmu..." required>`;
        } else {
            inputHTML = `
                <select id="answer-${q.id}" required>
                    <option value="">-- Pilih Jawaban --</option>
                    ${q.options.map(opt => 
                        `<option value="${opt.score}" data-label="${opt.label}">${opt.label} (${opt.score} poin)</option>`
                    ).join('')}
                </select>
            `;
        }
        
        return `
            <div class="checkin-question">
                <label>${idx + 1}. ${q.question}</label>
                ${inputHTML}
                <button onclick="submitAnswer(${q.id})">✅ Submit Jawaban</button>
            </div>
        `;
    }).join('');
}

function submitAnswer(questionId) {
    const question = data.habitQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const answerEl = document.getElementById('answer-' + questionId);
    const answerValue = answerEl.value.trim();
    
    if (!answerValue) {
        alert('Mohon isi jawaban terlebih dahulu!');
        return;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    let answer = '';
    let score = 0;
    
    if (question.type === 'text') {
        answer = answerValue;
        score = 0;
    } else {
        score = parseInt(answerValue);
        const selectedOption = answerEl.options[answerEl.selectedIndex];
        answer = selectedOption.getAttribute('data-label');
    }
    
    // Save individual record
    data.habitRecords.unshift({
        date: today,
        time: time,
        questionId: questionId,
        question: question.question,
        answer: answer,
        score: score
    });
    
    saveData();
    renderCheckinForm();
    renderHabitHistory();
    updateHabitStats();
    alert('✅ Jawaban berhasil disimpan!');
}

// Filter habit history
let habitFilteredRecords = [];

function renderHabitHistory() {
    const container = document.getElementById('habit-history-list');
    if (!container) return;
    
    const recordsToShow = habitFilteredRecords.length > 0 ? habitFilteredRecords : data.habitRecords;
    
    if (recordsToShow.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>Belum Ada Riwayat</h3></div>';
        return;
    }
    
    // Group by date
    const groupedByDate = {};
    recordsToShow.forEach(record => {
        if (!groupedByDate[record.date]) {
            groupedByDate[record.date] = [];
        }
        groupedByDate[record.date].push(record);
    });
    
    let html = '';
    Object.keys(groupedByDate).sort().reverse().forEach(date => {
        const records = groupedByDate[date];
        const totalScore = records.reduce((sum, r) => sum + r.score, 0);
        
        html += `
            <div class="list-item">
                <div class="list-item-header">
                    <span>📅 ${date}</span>
                    <span class="list-item-amount" style="color: #667eea;">⭐ ${totalScore} poin</span>
                </div>
                <div class="list-item-detail">
                    ${records.map(r => 
                        `<div><strong>${r.time}</strong> - ${r.question}: <strong>${r.answer}</strong> ${r.score > 0 ? `(${r.score} poin)` : ''}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterHabitHistory() {
    const startDate = document.getElementById('habit-start').value;
    const endDate = document.getElementById('habit-end').value;
    
    if (!startDate || !endDate) {
        alert('Mohon pilih tanggal mulai dan akhir!');
        return;
    }
    
    habitFilteredRecords = data.habitRecords.filter(r => r.date >= startDate && r.date <= endDate);
    renderHabitHistory();
    alert(`✅ Filter diterapkan: ${habitFilteredRecords.length} record`);
}

function resetHabitFilter() {
    document.getElementById('habit-start').value = '';
    document.getElementById('habit-end').value = '';
    habitFilteredRecords = [];
    renderHabitHistory();
}

function updateHabitStats() {
    const today = getToday();
    const todayRecords = data.habitRecords.filter(r => r.date === today);
    const todayScore = todayRecords.reduce((sum, r) => sum + r.score, 0);
    
    document.getElementById('habit-today-score').textContent = todayScore;
    
    // Calculate streak
    const uniqueDates = [...new Set(data.habitRecords.map(r => r.date))].sort().reverse();
    let streak = 0;
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const expectedDate = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates[i] === expectedDate) {
            streak++;
        } else {
            break;
        }
    }
    
    document.getElementById('habit-streak').textContent = streak + ' Hari';
    
    // Average
    if (uniqueDates.length > 0) {
        const totalByDate = {};
        data.habitRecords.forEach(r => {
            if (!totalByDate[r.date]) totalByDate[r.date] = 0;
            totalByDate[r.date] += r.score;
        });
        
        const avgScore = Math.round(
            Object.values(totalByDate).reduce((a, b) => a + b, 0) / uniqueDates.length
        );
        
        document.getElementById('habit-avg').textContent = avgScore;
    } else {
        document.getElementById('habit-avg').textContent = '0';
    }
}

// ========== FINANCE 2 (PRIVACY MODE) ==========
function toggleAmounts() {
    hideAmounts = !hideAmounts;
    
    // Update both Finance 1 and Finance 2 toggle buttons
    const buttons = [
        document.getElementById('privacy-toggle-btn-f1'),
        document.getElementById('privacy-toggle-btn')
    ];
    
    buttons.forEach(btn => {
        if (!btn) return;
        
        const icon = btn.querySelector('.privacy-icon');
        const text = btn.querySelector('.privacy-text');
        
        if (hideAmounts) {
            icon.textContent = '🙈';
            text.textContent = 'Show Amounts';
            btn.classList.add('active');
        } else {
            icon.textContent = '👁️';
            text.textContent = 'Hide Amounts';
            btn.classList.remove('active');
        }
    });
    
    // Re-render both Finance 1 and Finance 2 displays
    updateDashboard();
    renderTransactionList();
    renderDebtList();
    renderSaldoTab();
    renderFinance2();
    
    // Re-render charts if on grafik tab
    setTimeout(() => {
        renderCharts();
        renderChartsF2();
    }, 100);
}

function renderFinance2() {
    updateDashboardF2();
    renderTransactionListF2();
    renderDebtListF2();
    renderSaldoTabF2();
    updateResumeSummaryF2();
    updateDebtSummaryF2();
}

function updateDashboardF2() {
    const totalBalance = data.wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalDebt = data.debts.filter(d => !d.paid && d.type === 'hutang').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    const totalReceivable = data.debts.filter(d => !d.paid && d.type === 'piutang').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    
    document.getElementById('total-balance-f2').textContent = formatCurrency(totalBalance);
    document.getElementById('total-debt-f2').textContent = formatCurrency(totalDebt);
    document.getElementById('total-receivable-f2').textContent = formatCurrency(totalReceivable);
}

function filterFinance2Transactions() {
    const period = document.getElementById('finance2-period').value;
    const categoryFilter = document.getElementById('finance2-category-filter').value;
    
    if (period === 'custom') {
        document.getElementById('finance2-start').style.display = 'inline-block';
        document.getElementById('finance2-end').style.display = 'inline-block';
    } else {
        document.getElementById('finance2-start').style.display = 'none';
        document.getElementById('finance2-end').style.display = 'none';
    }
    
    renderTransactionListF2();
}

function filterTransactionsByPeriodF2() {
    const period = document.getElementById('finance2-period').value;
    const categoryFilter = document.getElementById('finance2-category-filter').value;
    const today = new Date();
    
    let filtered = [];
    
    // Filter by period
    if (period === 'all') {
        filtered = data.transactions;
    } else if (period === 'month') {
        const year = today.getFullYear();
        const month = today.getMonth();
        filtered = data.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
    } else if (period === 'custom') {
        const start = document.getElementById('finance2-start').value;
        const end = document.getElementById('finance2-end').value;
        if (!start || !end) {
            filtered = data.transactions;
        } else {
            filtered = data.transactions.filter(t => t.date >= start && t.date <= end);
        }
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        const [type, category] = categoryFilter.split('-');
        if (type && category) {
            filtered = filtered.filter(t => t.type === type && t.category === category);
        }
    }
    
    return filtered;
}

function renderTransactionListF2() {
    const container = document.getElementById('transaction-list-f2');
    if (!container) return;
    
    const filteredTrans = filterTransactionsByPeriodF2();
    
    if (filteredTrans.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Belum Ada Transaksi</h3></div>';
        return;
    }
    
    container.innerHTML = filteredTrans.map(t => {
        const wallet = data.wallets.find(w => w.id === t.walletId);
        const walletName = wallet ? wallet.name : 'Unknown';
        const typeClass = t.type === 'expense' ? 'expense' : '';
        const sign = t.type === 'expense' ? '-' : '+';
        
        return `
            <div class="list-item ${typeClass}">
                <div class="list-item-header">
                    <span>${t.category}</span>
                    <span class="list-item-amount">${sign} ${formatCurrency(t.amount)}</span>
                </div>
                <div class="list-item-detail">
                    ${t.date} • ${walletName} ${t.note ? '• ' + t.note : ''}
                </div>
            </div>
        `;
    }).join('');
    
    updateResumeSummaryF2();
}

function updateResumeSummaryF2() {
    const filtered = filterTransactionsByPeriodF2();
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    
    document.getElementById('resume-income-f2').textContent = formatCurrency(totalIncome);
    document.getElementById('resume-expense-f2').textContent = formatCurrency(totalExpense);
    document.getElementById('resume-balance-f2').textContent = formatCurrency(balance);
}

function renderSaldoTabF2() {
    const container = document.getElementById('saldo-list-f2');
    if (!container) return;
    
    container.innerHTML = data.wallets.map(w => {
        const transactions = data.transactions.filter(t => t.walletId === w.id);
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        return `
            <div class="wallet-card">
                <div class="wallet-header">
                    <h3>${w.name}</h3>
                    <h2>${formatCurrency(w.balance)}</h2>
                </div>
                <div class="wallet-details">
                    <div class="wallet-detail income">
                        <span>💵 Pemasukan:</span>
                        <span>${formatCurrency(income)}</span>
                    </div>
                    <div class="wallet-detail expense">
                        <span>💸 Pengeluaran:</span>
                        <span>${formatCurrency(expense)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderDebtListF2() {
    const container = document.getElementById('debt-list-f2');
    if (!container) return;
    
    const unpaidDebts = data.debts.filter(d => !d.paid);
    
    if (unpaidDebts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤝</div><h3>Tidak Ada Hutang/Piutang Aktif</h3><p>Semua sudah lunas! 🎉</p></div>';
    } else {
        container.innerHTML = unpaidDebts.map(d => {
            const label = d.type === 'hutang' ? 'Hutang ke' : 'Piutang dari';
            const remaining = d.amount - (d.paidAmount || 0);
            const paidInfo = d.paidAmount > 0 ? `<br>Sudah dibayar: ${formatCurrency(d.paidAmount)}` : '';
            
            let walletInfo = '';
            if (d.type === 'piutang' && d.walletId) {
                const wallet = data.wallets.find(w => w.id === d.walletId);
                if (wallet) walletInfo = `Dari: ${wallet.name} • `;
            }
            
            return `
                <div class="list-item debt">
                    <div class="list-item-header">
                        <span>${label} ${d.person}</span>
                        <span class="list-item-amount" style="color: #ff9800;">${formatCurrency(remaining)}</span>
                    </div>
                    <div class="list-item-detail">
                        ${walletInfo}${d.note || 'Tidak ada catatan'}${paidInfo}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderPaidDebtListF2();
    updateDebtSummaryF2();
}

function renderPaidDebtListF2() {
    const container = document.getElementById('paid-debt-list-f2');
    if (!container) return;
    
    const paidDebts = data.debts.filter(d => d.paid);
    
    if (paidDebts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Belum Ada Riwayat</h3><p>Hutang/piutang yang sudah lunas akan muncul di sini</p></div>';
        return;
    }
    
    container.innerHTML = paidDebts.map(d => {
        const label = d.type === 'hutang' ? 'Hutang ke' : 'Piutang dari';
        
        let walletInfo = '';
        if (d.paidWalletId) {
            const wallet = data.wallets.find(w => w.id === d.paidWalletId);
            if (wallet) {
                const action = d.type === 'hutang' ? 'Dibayar dari' : 'Diterima ke';
                walletInfo = `${action}: ${wallet.name} • `;
            }
        }
        
        return `
            <div class="list-item" style="border-left-color: #4CAF50;">
                <div class="list-item-header">
                    <span>${label} ${d.person}</span>
                    <span class="list-item-amount" style="color: #4CAF50;">✅ ${formatCurrency(d.amount)}</span>
                </div>
                <div class="list-item-detail">
                    ${walletInfo}Lunas: ${d.paidDate || '-'} ${d.note ? '• ' + d.note : ''}
                </div>
            </div>
        `;
    }).join('');
}

function updateDebtSummaryF2() {
    const totalDebt = data.debts.filter(d => !d.paid && d.type === 'hutang').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    const totalReceivable = data.debts.filter(d => !d.paid && d.type === 'piutang').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
    const balance = totalReceivable - totalDebt;
    
    document.getElementById('debt-total-f2').textContent = formatCurrency(totalDebt);
    document.getElementById('receivable-total-f2').textContent = formatCurrency(totalReceivable);
    document.getElementById('debt-balance-f2').textContent = formatCurrency(balance);
}

function renderChartsF2() {
    // Expense Pie Chart
    const expenseCtx = document.getElementById('expense-chart-f2');
    if (expenseCtx) {
        const expenses = data.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: hideAmounts ? 'Pengeluaran per Kategori (Hidden)' : 'Pengeluaran per Kategori' },
                    tooltip: { enabled: !hideAmounts }
                }
            }
        });
    }
    
    // Income Bar Chart
    const incomeCtx = document.getElementById('income-chart-f2');
    if (incomeCtx) {
        const incomes = data.transactions.filter(t => t.type === 'income');
        const categoryTotals = {};
        incomes.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
        
        new Chart(incomeCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    label: hideAmounts ? 'Hidden' : 'Pemasukan',
                    data: Object.values(categoryTotals),
                    backgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: hideAmounts ? 'Pemasukan per Kategori (Hidden)' : 'Pemasukan per Kategori' },
                    tooltip: { enabled: !hideAmounts }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { display: !hideAmounts }
                    }
                }
            }
        });
    }
    
    // Trend Line Chart
    const trendCtx = document.getElementById('trend-chart-f2');
    if (trendCtx) {
        const last6Months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last6Months.push(date.toISOString().substring(0, 7));
        }
        
        const incomeData = last6Months.map(month => {
            return data.transactions
                .filter(t => t.type === 'income' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0);
        });
        
        const expenseData = last6Months.map(month => {
            return data.transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(month))
                .reduce((sum, t) => sum + t.amount, 0);
        });
        
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: last6Months.map(m => m.substring(5)),
                datasets: [
                    {
                        label: hideAmounts ? 'Hidden' : 'Pemasukan',
                        data: incomeData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: hideAmounts ? 'Hidden' : 'Pengeluaran',
                        data: expenseData,
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: hideAmounts ? 'Trend 6 Bulan (Hidden)' : 'Trend 6 Bulan Terakhir' },
                    tooltip: { enabled: !hideAmounts }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { display: !hideAmounts }
                    }
                }
            }
        });
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // Set today's date
    const today = getToday();
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = today;
    });
    
    // Initial render
    renderWalletList();
    renderCategoryLists();
    renderTransactionList();
    renderDebtList();
    renderSaldoTab();
    renderQuestionsList();
    renderCheckinForm();
    renderHabitHistory();
    updateDashboard();
    updateHabitStats();
    
    // Set default filter dates
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    document.getElementById('habit-start').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('habit-end').value = today;
});
