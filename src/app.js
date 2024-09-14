
// localStorage
window.onload = function () {
  const savedAmount = localStorage.getItem("budget");
  if (savedAmount) {
    document.getElementById("amount-display").textContent = `Available: ${savedAmount} €`;
  }

  const savedSavingAmount = localStorage.getItem("savingAmount");
  if (savedSavingAmount) {
    document.getElementById("savingAmount-display").textContent = `${savedSavingAmount} €`;
  }

  const savedProcent = localStorage.getItem("procent");
  if (savedProcent) {
    document.getElementById('reachedProcent-display').textContent = `You reached ${savedProcent} % of your goal!`;
  }

  const savedDebts = JSON.parse(localStorage.getItem("debts"));
  if (savedDebts) {
    savedDebts.forEach(function(debt) {
      addDebtToTable(debt.amount, debt.recipient, debt.reason, debt.deadline);
    });
  }
};

// export Data button
function exportData() {
  if (confirm("You are about to download the 'data.json' file containing your data.")) {
    const data = {
      budget: localStorage.getItem("budget"),
      savingAmount: localStorage.getItem("savingAmount"),
      procent: localStorage.getItem("procent"),
      debts: JSON.parse(localStorage.getItem("debts"))
    };
    const dataStr = JSON.stringify(data);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }
}

// delete Data button
function deleteData() {
  if (confirm("Are you sure you want to delete all data? \nWe do not store user data, so neither you are able to undo this action")) {
    localStorage.clear();
    document.getElementById("amount-display").textContent = "Available: ";
    document.getElementById("savingAmount-display").textContent = "";
    document.getElementById("reachedProcent-display").textContent = "No goal set.";
    document.getElementById("amount-input").value = '';
    document.getElementById("debtsTable").innerHTML = `
      <tr>
        <th>Amount</th>
        <th>Recipient</th>
        <th>Reason</th>
        <th>Deadline</th>
      </tr>`;
  }
}

// budget section
let isAddMode = false;
let isRemoveMode = false;

function onBudgetEdit() {
  document.getElementById("edit-button").style.display = "none";
  document.getElementById("input-section").style.display = "block";
  isAddMode = false;
  isRemoveMode = false;
}

function addAmount() {
  document.getElementById("edit-button").style.display = "none";
  document.getElementById("input-section").style.display = "block";
  isAddMode = true;
  isRemoveMode = false;
}

function removeAmount() {
  document.getElementById("edit-button").style.display = "none";
  document.getElementById("input-section").style.display = "block";
  isRemoveMode = true;
  isAddMode = false;
}

function submitAmount() {
  let amount = parseFloat(localStorage.getItem("budget")) || 0;
  let inputAmount = parseFloat(document.getElementById("amount-input").value) || 0;

  let newAmount;

  if (isAddMode) {
    newAmount = amount + inputAmount;
  } else if (isRemoveMode) {
    newAmount = amount - inputAmount;
  } else {
    newAmount = inputAmount;
  }

  localStorage.setItem("budget", newAmount);
  document.getElementById("amount-display").textContent = `Available: ${newAmount.toFixed(2)} €`;

  document.getElementById("input-section").style.display = "none";
  document.getElementById("edit-button").style.display = "block";

  updatePercentage();

  isAddMode = false;
  isRemoveMode = false;

  if (newAmount < 0) {
    if (confirm("Attention! Your budget is lower that 0. Would you like to add a debt?")) {
      addDebt();
    }
  }
}

// saving section
function onSavingEdit() {
  document.getElementById("saving-section_edit-button").style.display = "none";
  document.getElementById("saving-section_input-section").style.display = "block";
}

function submitSavingAmount() {
  const newAmount = document.getElementById("saving-amount-input").value;

  localStorage.setItem("savingAmount", newAmount);

  document.getElementById("savingAmount-display").textContent = `${newAmount} €`;

  updatePercentage();

  document.getElementById("saving-section_edit-button").style.display = "block";
  document.getElementById("saving-section_input-section").style.display = "none";
}

function updatePercentage() {
  const currentBudget = localStorage.getItem("budget");
  const savingGoal = localStorage.getItem("savingAmount");

  if (!currentBudget || !savingGoal || isNaN(currentBudget) || isNaN(savingGoal) || savingGoal == 0) {
    document.getElementById('reachedProcent-display').textContent = "You reached 0 % of your goal!";
    localStorage.setItem("procent", 0);
    return;
  }

  let procent = (currentBudget / savingGoal) * 100;
  procent = procent.toFixed(1);

  localStorage.setItem("procent", procent);
  document.getElementById('reachedProcent-display').textContent = `You reached ${procent} % of your goal!`;
}

// debts section
function addDebt() {
  document.getElementById('debtsMenuSection').style.display = "none";
  document.getElementById('debtsEmptySection').style.display = "block";
}

function submitDebt() {
  document.getElementById('debtsMenuSection').style.display = "block";
  document.getElementById('debtsEmptySection').style.display = "none";

  let debts_amount = document.getElementById('debts_amount').value;
  let debts_recipient = document.getElementById('debts_recipient').value;
  let debts_reason = document.getElementById('debts_reason').value;
  let debts_deadline = document.getElementById('debts_deadline').value;

  addDebtToTable(debts_amount, debts_recipient, debts_reason, debts_deadline);

  let debts = JSON.parse(localStorage.getItem("debts")) || [];
  debts.push({ amount: debts_amount, recipient: debts_recipient, reason: debts_reason, deadline: debts_deadline });
  localStorage.setItem("debts", JSON.stringify(debts));

  document.getElementById('debts_amount').value = '';
  document.getElementById('debts_recipient').value = '';
  document.getElementById('debts_reason').value = '';
  document.getElementById('debts_deadline').value = '';
}

function addDebtToTable(amount, recipient, reason, deadline) {
  let table = document.getElementById('debtsTable');
  let newRow = table.insertRow();

  let cell1 = newRow.insertCell(0);
  let cell2 = newRow.insertCell(1);
  let cell3 = newRow.insertCell(2);
  let cell4 = newRow.insertCell(3);
  let cell5 = newRow.insertCell(4);

  cell1.textContent = `${amount} €`;
  cell2.textContent = recipient;
  cell3.textContent = reason;
  cell4.textContent = deadline;

  let deleteButton = document.createElement('button');
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delRowButton");
  deleteButton.onclick = function() {
    deleteDebt(newRow, amount, recipient, reason, deadline);
  };

  cell5.appendChild(deleteButton);
}

function deleteDebt(row, amount, recipient, reason, deadline) {
  row.remove();

  // localstorage
  let debts = JSON.parse(localStorage.getItem("debts")) || [];
  debts = debts.filter(debt => debt.amount !== amount || debt.recipient !== recipient || debt.reason !== reason || debt.deadline !== deadline);
  localStorage.setItem("debts", JSON.stringify(debts));
}

