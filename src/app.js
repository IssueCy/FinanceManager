// XXS protection
function sanitizeHTML(input) {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
}

// localStorage
window.onload = function () {
  const savedAmount = localStorage.getItem("budget");
  if (savedAmount) {
    document.getElementById("amount-display").textContent = `Available: ${sanitizeHTML(savedAmount)} €`;
  }

  const savedSavingAmount = localStorage.getItem("savingAmount");
  if (savedSavingAmount) {
    document.getElementById("savingAmount-display").textContent = `${sanitizeHTML(savedSavingAmount)} €`;
  }

  const savedProcent = localStorage.getItem("procent");
  if (savedProcent) {
    document.getElementById('reachedProcent-display').textContent = `You reached ${sanitizeHTML(savedProcent)} % of your goal!`;
  }

  const savedDebts = JSON.parse(localStorage.getItem("debts"));
  if (savedDebts) {
    savedDebts.forEach(function(debt) {
      addDebtToTable(sanitizeHTML(debt.amount), sanitizeHTML(debt.recipient), sanitizeHTML(debt.reason), sanitizeHTML(debt.deadline));
    });
  }

  const savedLogs = JSON.parse(localStorage.getItem("logs"));
  if (savedLogs) {
    savedLogs.forEach(log => {
      let table = document.getElementById('logTable');
      let newRow = table.insertRow();

      let amountCell = newRow.insertCell(0);
      amountCell.textContent = log.amount;

      let typeCell = newRow.insertCell(1);
      typeCell.textContent = log.action;

      let dateCell = newRow.insertCell(2);
      dateCell.textContent = log.date;
    });
  }
};

// import data from users data.json file
function importData() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importedData = JSON.parse(event.target.result);

        console.log("Imported Data:", importedData);

        if (importedData.budget) {
          localStorage.setItem('budget', importedData.budget);
          document.getElementById("amount-display").textContent = `Available: ${sanitizeHTML(importedData.budget)} €`;
        } else {
          console.error("Budget not found in imported data");
        }

        if (importedData.savingAmount) {
          localStorage.setItem('savingAmount', importedData.savingAmount);
          document.getElementById("savingAmount-display").textContent = `${sanitizeHTML(importedData.savingAmount)} €`;
        } else {
          console.error("Saving amount not found in imported data");
        }

        if (importedData.procent) {
          localStorage.setItem('procent', importedData.procent);
          document.getElementById('reachedProcent-display').textContent = `You reached ${sanitizeHTML(importedData.procent)} % of your goal!`;
        } else {
          console.error("Percentage (procent) not found in imported data");
        }

        if (Array.isArray(importedData.debts)) {
          localStorage.setItem('debts', JSON.stringify(importedData.debts));
          document.getElementById("debtsTable").innerHTML = `
            <tr>
              <th>Amount</th>
              <th>Recipient</th>
              <th>Reason</th>
              <th>Deadline</th>
            </tr>`;
          importedData.debts.forEach(debt => {
            addDebtToTable(sanitizeHTML(debt.amount), sanitizeHTML(debt.recipient), sanitizeHTML(debt.reason), sanitizeHTML(debt.deadline));
          });
        } else {
          console.error("Debts array not found or invalid in imported data");
        }

        if (Array.isArray(importedData.logs)) {
          localStorage.setItem('logs', JSON.stringify(importedData.logs));
          document.getElementById("logTable").innerHTML = `
            <tr>
              <th>Amount</th>
              <th>Action</th>
              <th>Date</th>
            </tr>`;
          importedData.logs.forEach(log => {
            let table = document.getElementById('logTable');
            let newRow = table.insertRow();

            let amountCell = newRow.insertCell(0);
            amountCell.textContent = sanitizeHTML(log.amount);

            let typeCell = newRow.insertCell(1);
            typeCell.textContent = sanitizeHTML(log.action);

            let dateCell = newRow.insertCell(2);
            dateCell.textContent = sanitizeHTML(log.date);
          });
        } else {
          console.error("Logs array not found or invalid in imported data");
        }

        updatePercentage();

        alert('Data imported successfully!');
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert('Error importing data: Invalid file format.');
      }
    };
    reader.readAsText(file);
  } else {
    alert('Please select a file.');
  }
}



// export Data button
function exportData() {
  if (confirm("You are about to download the 'data.json' file containing your data.")) {
    const data = {
      budget: localStorage.getItem("budget"),
      savingAmount: localStorage.getItem("savingAmount"),
      procent: localStorage.getItem("procent"),
      debts: JSON.parse(localStorage.getItem("debts")),
      logs: JSON.parse(localStorage.getItem("logs"))
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

      let table = document.getElementById('logTable');
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
      localStorage.removeItem("logs");
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
  let inputAmount = parseFloat(sanitizeHTML(document.getElementById("amount-input").value)) || 0;

  let newAmount;

  if (isAddMode) {
    newAmount = amount + inputAmount;
    addLog(inputAmount.toFixed(2), "Amount added");
  } else if (isRemoveMode) {
    newAmount = amount - inputAmount;
    addLog(inputAmount.toFixed(2), "Amount removed");
  } else {
    newAmount = inputAmount;
    addLog(newAmount.toFixed(2), "Amount edited");
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
  const newAmount = sanitizeHTML(document.getElementById("saving-amount-input").value);

  localStorage.setItem("savingAmount", newAmount);
  document.getElementById("savingAmount-display").textContent = `${newAmount} €`;

  addLog(newAmount, "Saving goal edited");

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
  document.getElementById('reachedProcent-display').textContent = `You reached ${sanitizeHTML(procent)} % of your goal!`;
}

// debts section
function addDebt() {
  document.getElementById('debtsMenuSection').style.display = "none";
  document.getElementById('debtsEmptySection').style.display = "block";
}

function submitDebt() {
  document.getElementById('debtsMenuSection').style.display = "block";
  document.getElementById('debtsEmptySection').style.display = "none";

  let debts_amount = sanitizeHTML(document.getElementById('debts_amount').value);
  let debts_recipient = sanitizeHTML(document.getElementById('debts_recipient').value);
  let debts_reason = sanitizeHTML(document.getElementById('debts_reason').value);
  let debts_deadline = sanitizeHTML(document.getElementById('debts_deadline').value);

  addDebtToTable(debts_amount, debts_recipient, debts_reason, debts_deadline);

  let debts = JSON.parse(localStorage.getItem("debts")) || [];
  debts.push({ amount: debts_amount, recipient: debts_recipient, reason: debts_reason, deadline: debts_deadline });
  localStorage.setItem("debts", JSON.stringify(debts));

  addLog(debts_amount, "New debt added");

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

  cell1.textContent = `${sanitizeHTML(amount)} €`;
  cell2.textContent = sanitizeHTML(recipient);
  cell3.textContent = sanitizeHTML(reason);
  cell4.textContent = sanitizeHTML(deadline);

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

  addLog(amount, "Debt removed");
}

function addLog(amount, actionType) {
  let table = document.getElementById('logTable');
  let newRow = table.insertRow();

  let amountCell = newRow.insertCell(0);
  amountCell.textContent = amount ? `${amount} €` : 'N/A';

  let typeCell = newRow.insertCell(1);
  typeCell.textContent = actionType;

  let dateCell = newRow.insertCell(2);
  let currentDate = new Date();
  dateCell.textContent = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  // localstorage
  let logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.push({
    amount: amount ? `${amount} €` : 'N/A',
    action: actionType,
    date: `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}` 
  }),
  localStorage.setItem("logs", JSON.stringify(logs));
}

function deleteLogs() {
  let table = document.getElementById('logTable');

  while(table.rows.length > 1) {
    table.deleteRow(1);
    localStorage.removeItem("logs");
  }
}
