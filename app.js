// Estrutura de dados
let currentYear = null;
let currentMonth = null;

// Funções de navegação
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showHomePage() {
    showPage('home-page');
}

function showYearList() {
    renderYearList();
    showPage('year-list');
}

function showYearPage(year) {
    currentYear = year;
    document.getElementById('selected-year').textContent = year;
    renderMonths();
    showPage('year-page');
}

function showMonthPage(month) {
    currentMonth = month;
    document.getElementById('selected-month').textContent = getMonthName(month);
    renderExpenses();
    showPage('month-page');
}

// Funções de Modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showCreateYearModal() {
    showModal('create-year-modal');
}

function showAddFixedExpenseModal() {
    showModal('add-fixed-expense-modal');
}

function showAddVariableExpenseModal() {
    showModal('add-variable-expense-modal');
}

function showAddCreditCardModal() {
    // Update bank options before showing modal
    const bankSelect = document.getElementById('card-bank');
    const banks = getBanks();
    
    bankSelect.innerHTML = banks.map(bank => 
        `<option value="${bank}">${bank}</option>`
    ).join('') + '<option value="new">Novo banco...</option>';
    
    showModal('add-credit-card-modal');
}

function showAddCreditCardModalOriginal() {
    showModal('add-credit-card-modal');
}

function showAddIncomeModal() {
    showModal('add-income-modal');
}

function showAddFixedIncomeModal() {
    showModal('add-fixed-income-modal');
}

// Funções de gerenciamento de dados
function getYears() {
    return JSON.parse(localStorage.getItem('years')) || [];
}

function saveYears(years) {
    localStorage.setItem('years', JSON.stringify(years));
}

function getExpenses(year, month) {
    const key = `expenses_${year}_${month}`;
    return JSON.parse(localStorage.getItem(key)) || {
        fixed: [],
        variable: [],
        creditCard: [],
        income: []
    };
}

function saveExpenses(year, month, expenses) {
    const key = `expenses_${year}_${month}`;
    localStorage.setItem(key, JSON.stringify(expenses));
}

function getBanks() {
    return JSON.parse(localStorage.getItem('banks')) || ['Nubank', 'Santander', 'Itaú'];
}

function saveBanks(banks) {
    localStorage.setItem('banks', JSON.stringify(banks));
}

function addNewBank() {
    const newBankInput = document.getElementById('new-bank-input');
    const bankSelect = document.getElementById('card-bank');
    const newBank = newBankInput.value.trim();
    
    if (newBank) {
        const banks = getBanks();
        if (!banks.includes(newBank)) {
            banks.push(newBank);
            saveBanks(banks);
            
            // Update select options
            const option = new Option(newBank, newBank);
            bankSelect.add(option);
            
            // Select the new bank
            bankSelect.value = newBank;
        }
        // Hide the new bank input
        newBankInput.style.display = 'none';
        newBankInput.value = '';
    }
}

function toggleBankInput() {
    const bankSelect = document.getElementById('card-bank');
    const newBankInput = document.getElementById('new-bank-input');
    
    if (bankSelect.value === 'new') {
        newBankInput.style.display = 'block';
        newBankInput.focus();
    } else {
        newBankInput.style.display = 'none';
    }
}

// Funções de criação
function createYear() {
    const yearInput = document.getElementById('new-year-input');
    const year = parseInt(yearInput.value);
    
    if (year && year > 0) {
        const years = getYears();
        if (!years.includes(year)) {
            years.push(year);
            saveYears(years);
            closeModal('create-year-modal');
            showYearList();
        } else {
            alert('Este ano já existe!');
        }
    } else {
        alert('Por favor, insira um ano válido!');
    }
}

function addFixedExpense() {
    const name = document.getElementById('fixed-expense-name').value;
    const amount = parseFloat(document.getElementById('fixed-expense-amount').value);

    if (name && amount > 0) {
        for (let month = 1; month <= 12; month++) {
            const expenses = getExpenses(currentYear, month);
            expenses.fixed.push({ name, amount });
            saveExpenses(currentYear, month, expenses);
        }
        closeModal('add-fixed-expense-modal');
        renderExpenses();
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}

function addVariableExpense() {
    const name = document.getElementById('variable-expense-name').value;
    const amount = parseFloat(document.getElementById('variable-expense-amount').value);

    if (name && amount > 0) {
        const expenses = getExpenses(currentYear, currentMonth);
        expenses.variable.push({ name, amount });
        saveExpenses(currentYear, currentMonth, expenses);
        closeModal('add-variable-expense-modal');
        renderExpenses();
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}

function addCreditCardExpense() {
    const bank = document.getElementById('card-bank').value;
    const name = document.getElementById('card-expense-name').value;
    const amount = parseFloat(document.getElementById('card-expense-amount').value);
    const installments = parseInt(document.getElementById('card-installments').value);
    const responsible = document.getElementById('card-responsible').value;
    const personName = responsible === 'other' ? document.getElementById('person-name').value : '';

    if (bank && name && amount > 0 && 
        (responsible === 'self' || (responsible === 'other' && personName))) {
        const installmentAmount = amount / installments;
        
        for (let i = 0; i < installments; i++) {
            const targetMonth = ((currentMonth + i - 1) % 12) + 1;
            const targetYear = currentYear + Math.floor((currentMonth + i - 1) / 12);
            
            const expenses = getExpenses(targetYear, targetMonth);
            expenses.creditCard.push({
                bank,
                name,
                installmentAmount,
                installmentNumber: i + 1,
                totalInstallments: installments,
                responsible,
                personName
            });
            saveExpenses(targetYear, targetMonth, expenses);
        }
        
        closeModal('add-credit-card-modal');
        renderExpenses();
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}

function addIncome() {
    const name = document.getElementById('income-name').value;
    const amount = parseFloat(document.getElementById('income-amount').value);

    if (name && !isNaN(amount) && amount > 0) {
        const expenses = getExpenses(currentYear, currentMonth);
        if (!expenses.income) {
            expenses.income = [];
        }
        expenses.income.push({ name, amount });
        saveExpenses(currentYear, currentMonth, expenses);
        closeModal('add-income-modal');
        
        // Clear form fields
        document.getElementById('income-name').value = '';
        document.getElementById('income-amount').value = '';
        
        renderExpenses();
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}

function addFixedIncome() {
    const name = document.getElementById('fixed-income-name').value;
    const amount = parseFloat(document.getElementById('fixed-income-amount').value);

    if (name && amount > 0) {
        for (let month = 1; month <= 12; month++) {
            const expenses = getExpenses(currentYear, month);
            if (!expenses.income) {
                expenses.income = [];
            }
            expenses.income.push({ name, amount, isFixed: true });
            saveExpenses(currentYear, month, expenses);
        }
        closeModal('add-fixed-income-modal');
        renderExpenses();
    } else {
        alert('Por favor, preencha todos os campos corretamente!');
    }
}

function editFixedExpense(name, currentAmount) {
    const newAmount = prompt(`Digite o novo valor para "${name}":`, currentAmount);
    
    if (newAmount !== null && !isNaN(newAmount) && newAmount > 0) {
        const expenses = getExpenses(currentYear, currentMonth);
        expenses.fixed = expenses.fixed.map(expense => {
            if (expense.name === name) {
                return { ...expense, amount: parseFloat(newAmount) };
            }
            return expense;
        });
        saveExpenses(currentYear, currentMonth, expenses);
        renderExpenses();
    }
}

function editIncome(name, currentAmount, isFixed) {
    const newAmount = prompt(`Digite o novo valor para "${name}":`, currentAmount);
    
    if (newAmount !== null && !isNaN(newAmount) && newAmount > 0) {
        const expenses = getExpenses(currentYear, currentMonth);
        expenses.income = expenses.income.map(income => {
            if (income.name === name) {
                return { ...income, amount: parseFloat(newAmount) };
            }
            return income;
        });
        saveExpenses(currentYear, currentMonth, expenses);
        renderExpenses();
    }
}

// Funções de exclusão
function deleteFixedExpense(expenseName) {
    if (confirm(`Deseja realmente excluir a despesa fixa "${expenseName}"?`)) {
        // Remove from all months in current year
        for (let month = 1; month <= 12; month++) {
            const expenses = getExpenses(currentYear, month);
            expenses.fixed = expenses.fixed.filter(expense => expense.name !== expenseName);
            saveExpenses(currentYear, month, expenses);
        }
        renderExpenses();
    }
}

function deleteVariableExpense(expenseName) {
    if (confirm(`Deseja realmente excluir a despesa variável "${expenseName}"?`)) {
        const expenses = getExpenses(currentYear, currentMonth);
        expenses.variable = expenses.variable.filter(expense => expense.name !== expenseName);
        saveExpenses(currentYear, currentMonth, expenses);
        renderExpenses();
    }
}

function deleteCreditCardExpense(bank, name, installmentNumber, totalInstallments, responsible, personName) {
    const escapedName = name.replace(/'/g, "\\'");
    const escapedBank = bank.replace(/'/g, "\\'");
    const escapedPersonName = personName.replace(/'/g, "\\'");

    if (confirm(`Deseja realmente excluir a despesa "${escapedName}" do cartão ${escapedBank}?`)) {
        const monthsBack = installmentNumber - 1;
        const startMonth = ((currentMonth - monthsBack - 1 + 12) % 12) + 1;
        const startYear = currentYear - Math.floor((monthsBack + 12 - currentMonth) / 12);
        
        for (let i = installmentNumber - 1; i < totalInstallments; i++) {
            const targetMonth = ((startMonth + i - 1) % 12) + 1;
            const targetYear = startYear + Math.floor((startMonth + i - 1) / 12);
            
            const expenses = getExpenses(targetYear, targetMonth);
            expenses.creditCard = expenses.creditCard.filter(expense => {
                return !(
                    expense.bank === bank && 
                    expense.name === name && 
                    expense.installmentNumber === i + 1 && 
                    expense.totalInstallments === totalInstallments &&
                    expense.responsible === responsible &&
                    (expense.personName || '') === (personName || '')
                );
            });
            saveExpenses(targetYear, targetMonth, expenses);
        }
        renderExpenses();
    }
}

function deleteIncome(incomeName) {
    if (confirm(`Deseja realmente excluir a receita "${incomeName}"?`)) {
        const expenses = getExpenses(currentYear, currentMonth);
        expenses.income = expenses.income.filter(income => income.name !== incomeName);
        saveExpenses(currentYear, currentMonth, expenses);
        renderExpenses();
    }
}

// Funções de renderização
function renderYearList() {
    const container = document.getElementById('years-container');
    const years = getYears().sort((a, b) => b - a);
    
    container.innerHTML = years.map(year => `
        <div class="year-card" onclick="showYearPage(${year})">
            ${year}
        </div>
    `).join('');
}

function renderMonths() {
    const container = document.getElementById('months-grid');
    const months = Array.from({length: 12}, (_, i) => i + 1);
    const colorPreferences = JSON.parse(localStorage.getItem('monthColors') || '{}');
    const colors = ['#f8f9fa', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', 
                   '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8'];
    
    container.innerHTML = months.map(month => {
        const savedColor = colorPreferences[`${currentYear}-${month}`] || '#f8f9fa';
        return `
            <div class="month-card" 
                 data-month="${month}" 
                 onclick="showMonthPage(${month})" 
                 style="background: ${savedColor}">
                ${getMonthName(month)}
                <button class="edit-color-btn" onclick="toggleColorPicker(${month}, event)">✎</button>
                <div id="color-picker-${month}" class="color-picker-container">
                    ${colors.map(color => `
                        <div class="color-option" 
                             style="background-color: ${color}"
                             onclick="setMonthColor(${month}, '${color}')">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getBankColorClass(bankName) {
    const normalizedBank = bankName.toLowerCase().replace(/\s+/g, '');
    const validBanks = ['nubank', 'santander', 'itau'];
    return validBanks.includes(normalizedBank) ? `bank-color-${normalizedBank}` : 'bank-color-default';
}

function renderExpenses() {
    const expenses = getExpenses(currentYear, currentMonth) || {
        fixed: [],
        variable: [],
        creditCard: [],
        income: []
    };
    
    // Fixed expenses section
    const fixedExpensesElement = document.getElementById('fixed-expenses');
    if (fixedExpensesElement) {
        fixedExpensesElement.innerHTML = (expenses.fixed || []).map(expense => `
            <div class="expense-item">
                <div class="expense-content">
                    <span>${expense.name}</span>
                    <span class="expense-amount" onclick="editFixedExpense('${expense.name.replace(/'/g, "\\'")}', ${expense.amount})">
                        R$ ${expense.amount.toFixed(2)}
                    </span>
                </div>
                <button class="delete-expense" onclick="deleteFixedExpense('${expense.name.replace(/'/g, "\\'")}')">✕</button>
            </div>
        `).join('');
    }

    // Variable expenses section
    const variableExpensesElement = document.getElementById('variable-expenses');
    if (variableExpensesElement) {
        variableExpensesElement.innerHTML = (expenses.variable || []).map(expense => `
            <div class="expense-item">
                <div class="expense-content">
                    <span>${expense.name}</span>
                    <span>R$ ${expense.amount.toFixed(2)}</span>
                </div>
                <button class="delete-expense" onclick="deleteVariableExpense('${expense.name.replace(/'/g, "\\'")}')">✕</button>
            </div>
        `).join('');
    }

    // Calculate bank totals
    const bankTotals = {};
    (expenses.creditCard || []).forEach(expense => {
        if (!bankTotals[expense.bank]) {
            bankTotals[expense.bank] = 0;
        }
        bankTotals[expense.bank] += expense.installmentAmount;
    });

    // Credit card section
    const creditCardSection = document.getElementById('credit-card-expenses');
    if (creditCardSection) {
        creditCardSection.innerHTML = `
            ${(expenses.creditCard || [])
                .filter(expense => expense.responsible === 'self')
                .map(expense => {
                    const escapedBank = expense.bank.replace(/'/g, "\\'");
                    const escapedName = expense.name.replace(/'/g, "\\'");
                    const bankColorClass = getBankColorClass(expense.bank);
                    return `
                        <div class="expense-item">
                            <div class="expense-content">
                                <span><span class="${bankColorClass}">${expense.bank}</span> - ${expense.name} (${expense.installmentNumber}/${expense.totalInstallments})</span>
                                <span>R$ ${expense.installmentAmount.toFixed(2)}</span>
                            </div>
                            <button class="delete-expense" onclick="deleteCreditCardExpense('${escapedBank}', '${escapedName}', ${expense.installmentNumber}, ${expense.totalInstallments}, 'self', '')">✕</button>
                        </div>
                    `;
                }).join('')}
        `;
    }

    // Bank totals section
    const bankTotalsSection = document.getElementById('bank-totals');
    if (bankTotalsSection) {
        bankTotalsSection.innerHTML = `
            <h3>Subtotais por Banco</h3>
            ${Object.entries(bankTotals)
                .map(([bank, total]) => `
                    <div class="bank-subtotal ${getBankColorClass(bank)}">
                        <strong>Subtotal ${bank}:</strong> R$ ${total.toFixed(2)}
                    </div>
                `).join('')}
        `;
    }

    // Third party expenses
    const thirdPartyContainer = document.getElementById('third-party-credit-card-expenses');
    if (thirdPartyContainer) {
        const thirdPartyExpenses = (expenses.creditCard || []).filter(expense => expense.responsible === 'other' && expense.personName);
        const groupedByPerson = {};
        
        thirdPartyExpenses.forEach(expense => {
            if (!groupedByPerson[expense.personName]) {
                groupedByPerson[expense.personName] = [];
            }
            groupedByPerson[expense.personName].push(expense);
        });

        thirdPartyContainer.innerHTML = '';
        
        Object.entries(groupedByPerson).forEach(([personName, personExpenses]) => {
            if (personName && personExpenses.length > 0) {
                const section = document.createElement('div');
                section.className = 'expenses-section';
                section.innerHTML = `
                    <h4>Cartão de ${personName}</h4>
                    ${personExpenses.map(expense => {
                        const escapedBank = expense.bank.replace(/'/g, "\\'");
                        const escapedName = expense.name.replace(/'/g, "\\'");
                        const escapedPersonName = expense.personName.replace(/'/g, "\\'");
                        const bankColorClass = getBankColorClass(expense.bank);
                        return `
                            <div class="expense-item">
                                <div class="expense-content">
                                    <span><span class="${bankColorClass}">${expense.bank}</span> - ${expense.name} (${expense.installmentNumber}/${expense.totalInstallments})</span>
                                    <span>R$ ${expense.installmentAmount.toFixed(2)}</span>
                                </div>
                                <button class="delete-expense" onclick="deleteCreditCardExpense('${escapedBank}', '${escapedName}', ${expense.installmentNumber}, ${expense.totalInstallments}, 'other', '${escapedPersonName}')">✕</button>
                            </div>
                        `;
                    }).join('')}
                `;
                thirdPartyContainer.appendChild(section);
            }
        });
    }

    // Income section
    const incomeSectionElement = document.getElementById('income-section');
    if (incomeSectionElement) {
        incomeSectionElement.innerHTML = (expenses.income || []).map(income => `
            <div class="expense-item">
                <div class="expense-content">
                    <span>${income.name}${income.isFixed ? ' (Fixa)' : ''}</span>
                    <span class="expense-amount" onclick="editIncome('${income.name.replace(/'/g, "\\'")}', ${income.amount}, ${income.isFixed || false})">
                        R$ ${income.amount.toFixed(2)}
                    </span>
                </div>
                <button class="delete-expense" onclick="deleteIncome('${income.name.replace(/'/g, "\\'")}')">✕</button>
            </div>
        `).join('');
    }

    updateMonthTotals(expenses);
}

function updateMonthTotals(expenses) {
    // Calculate expenses total
    let expensesTotal = 0;
    expensesTotal += (expenses.fixed || []).reduce((sum, expense) => sum + expense.amount, 0);
    expensesTotal += (expenses.variable || []).reduce((sum, expense) => sum + expense.amount, 0);
    expensesTotal += (expenses.creditCard || []).filter(expense => expense.responsible === 'self')
        .reduce((sum, expense) => sum + expense.installmentAmount, 0);
    
    // Calculate income total
    let incomeTotal = (expenses.income || []).reduce((sum, income) => sum + income.amount, 0);
    
    // Calculate remaining
    let remainingTotal = incomeTotal - expensesTotal;
    
    // Update displays
    document.getElementById('month-total').textContent = expensesTotal.toFixed(2);
    document.getElementById('income-total').textContent = incomeTotal.toFixed(2);
    document.getElementById('remaining-total').textContent = remainingTotal.toFixed(2);
}

// Função auxiliar
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
}

function togglePersonNameField() {
    const responsible = document.getElementById('card-responsible').value;
    const personNameField = document.getElementById('person-name');
    personNameField.style.display = responsible === 'other' ? 'block' : 'none';
}

function toggleColorPicker(monthNumber, event) {
    event.stopPropagation();
    const container = document.getElementById(`color-picker-${monthNumber}`);
    container.classList.toggle('active');
}

function setMonthColor(monthNumber, color) {
    const monthCard = document.querySelector(`[data-month="${monthNumber}"]`);
    monthCard.style.background = color;
    
    // Save the color preference
    const colorPreferences = JSON.parse(localStorage.getItem('monthColors') || '{}');
    colorPreferences[`${currentYear}-${monthNumber}`] = color;
    localStorage.setItem('monthColors', JSON.stringify(colorPreferences));
    
    // Hide the color picker
    document.getElementById(`color-picker-${monthNumber}`).classList.remove('active');
}

function resetAllData() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        showHomePage();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    showHomePage();
    document.getElementById('card-responsible').addEventListener('change', togglePersonNameField);
    document.getElementById('card-bank').addEventListener('change', toggleBankInput);
});