document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-links-container');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.innerHTML = navMenu.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    let friends = ['You'];
    let expenses = [];
    const expenseForm = document.getElementById('expense-form');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const paidBySelect = document.getElementById('paid-by');
    const splitBetweenDiv = document.getElementById('split-between');
    const expensesDiv = document.getElementById('expenses');
    const settlementsDiv = document.getElementById('settlements');
    const newFriendInput = document.getElementById('new-friend');
    const addFriendBtn = document.getElementById('add-friend-btn');

    function formatCurrency(amount) {
        return '₹' + amount.toFixed(2);
    }

    function renderFriends() {
        paidBySelect.innerHTML = '<option value="">Select person</option>';
        splitBetweenDiv.innerHTML = '';
        friends.forEach(friend => {
            const option = document.createElement('option');
            option.value = friend;
            option.textContent = friend;
            paidBySelect.appendChild(option);
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'friend-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `friend-${friend}`;
            checkbox.value = friend;
            checkbox.checked = true;
            const label = document.createElement('label');
            label.htmlFor = `friend-${friend}`;
            label.textContent = friend;
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            splitBetweenDiv.appendChild(checkboxDiv);
        });
    }

    function renderExpenses() {
        expensesDiv.innerHTML = '';
        if (expenses.length === 0) {
            expensesDiv.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No expenses added yet</p></div>';
            return;
        }
        expenses.forEach(expense => {
            const expenseEl = document.createElement('div');
            expenseEl.className = 'expense-item';
            expenseEl.innerHTML = `
                <div class="expense-details">
                    <h4>${expense.description}</h4>
                    <p class="expense-paid-by">Paid by ${expense.paidBy}</p>
                </div>
                <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            `;
            expensesDiv.appendChild(expenseEl);
        });
    }

    function calculateSettlements() {
        const balances = {};
        friends.forEach(friend => { balances[friend] = 0; });
        expenses.forEach(expense => {
            const amountPerPerson = expense.amount / expense.splitBetween.length;
            balances[expense.paidBy] += expense.amount;
            expense.splitBetween.forEach(person => { balances[person] -= amountPerPerson; });
        });
        const settlements = [];
        const creditors = [];
        const debtors = [];
        for (const person in balances) {
            if (balances[person] > 0.01) creditors.push({ person, amount: balances[person] });
            else if (balances[person] < -0.01) debtors.push({ person, amount: -balances[person] });
        }
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        while (creditors.length > 0 && debtors.length > 0) {
            const creditor = creditors[0];
            const debtor = debtors[0];
            const settlementAmount = Math.min(creditor.amount, debtor.amount);
            settlements.push({ from: debtor.person, to: creditor.person, amount: settlementAmount });
            creditor.amount -= settlementAmount;
            debtor.amount -= settlementAmount;
            if (creditor.amount < 0.01) creditors.shift();
            if (debtor.amount < 0.01) debtors.shift();
        }
        renderSettlements(settlements);
    }

    function renderSettlements(settlements) {
        settlementsDiv.innerHTML = '';
        if (settlements.length === 0) {
            settlementsDiv.innerHTML = '<div class="empty-state"><i class="fas fa-smile"></i><p>No settlements needed</p></div>';
            return;
        }
        settlements.forEach(settlement => {
            const settlementEl = document.createElement('div');
            settlementEl.className = 'settlement-item';
            settlementEl.innerHTML = `
                <span>${settlement.from} owes ${settlement.to}</span>
                <span class="positive">${formatCurrency(settlement.amount)}</span>
            `;
            settlementsDiv.appendChild(settlementEl);
        });
    }

    addFriendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const newFriend = newFriendInput.value.trim();
        if (newFriend && !friends.includes(newFriend)) {
            friends.push(newFriend);
            renderFriends();
            newFriendInput.value = '';
            if (expenses.length > 0) calculateSettlements();
        }
    });

    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const paidBy = paidBySelect.value;
        const splitBetween = [];
        const checkboxes = splitBetweenDiv.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => { splitBetween.push(checkbox.value); });
        if (!description || isNaN(amount) || amount <= 0 || !paidBy || splitBetween.length === 0) {
            alert('Please fill all fields correctly');
            return;
        }
        expenses.push({ description, amount, paidBy, splitBetween });
        descriptionInput.value = '';
        amountInput.value = '';
        paidBySelect.selectedIndex = 0;
        renderExpenses();
        calculateSettlements();
    });

    renderFriends();
    renderExpenses();
    calculateSettlements();
});