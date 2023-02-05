'use strict';

// DOM Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Mocked Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
let currentAccount = undefined;
let isMovementsSorted = false;

const generateUsernames = function (accounts) {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

const getAccountByUsername = function (username) {
  return accounts.find(account => account.username === username);
};

const getAccountByCredentials = function (username, pin) {
  const account = getAccountByUsername(username);
  return account && account.pin === pin ? account : undefined;
};

const loginUser = function (account) {
  currentAccount = account;
  labelWelcome.textContent = `Welcome back, ${account.owner.split(' ')[0]}!`;
  containerApp.style.opacity = 100;
};

const logoutUser = function () {
  currentAccount = undefined;
  labelWelcome.textContent = 'Log in to get started';
  containerApp.style.opacity = 0;
};

const displayMovements = function (movements, sorted) {
  let movs = sorted ? movements.slice().sort((a, b) => a - b) : movements;

  containerMovements.innerHTML = '';
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const movRow = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', movRow);
  });
};
const updBalance = function (account) {
  return (account.balance = account.movements.reduce(
    (acc, mov) => acc + mov,
    0
  ));
};

const displaySummary = function (movements) {
  let incomesTotal = 0,
    outocomesTotal = 0,
    interestRate = 0;

  /* Can be done with chaining filter() and reduce(),
  but in this case we will need to iterate throuth the array 4 times */
  movements.forEach(mov => {
    mov > 0 ? (incomesTotal += mov) : (outocomesTotal += mov);
  });

  interestRate = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * 1.2) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, el) => acc + el, 0);

  labelSumIn.textContent = `${incomesTotal}€`;
  labelSumOut.textContent = `${Math.abs(outocomesTotal)}€`;
  labelSumInterest.textContent = `${interestRate}€`;
};

const updateUI = function () {
  displayMovements(currentAccount.movements);
  labelBalance.textContent = `${updBalance(currentAccount)} EUR`;
  displaySummary(currentAccount.movements);
};

const transferMoney = function (accountFrom, accountTo, amount) {
  if (!accountFrom || !accountTo || amount <= 0 || amount > accountFrom.balance)
    return;
  accountFrom.movements.push(-amount);
  accountTo.movements.push(amount);
};

const requestLoan = function (account, amount) {
  if (amount > 0 && account.movements.some(mov => mov >= amount * 0.1)) {
    account.movements.push(amount);
  }
};

const closeAccount = function (account) {
  const accIndex = accounts.indexOf(account);
  accounts.splice(accIndex, 1);
};

const init = function () {
  generateUsernames(accounts);

  btnLogin.addEventListener('click', e => {
    e.preventDefault();
    const account = getAccountByCredentials(
      inputLoginUsername.value,
      Number(inputLoginPin.value)
    );
    if (account) {
      loginUser(account);
      updateUI();
    } else {
      console.log('Credentials are invalid');
    }

    inputLoginUsername.value = inputLoginPin.value = '';
  });

  btnTransfer.addEventListener('click', e => {
    e.preventDefault();
    transferMoney(
      currentAccount,
      getAccountByUsername(inputTransferTo.value),
      Number(inputTransferAmount.value)
    );
    inputTransferTo.value = inputTransferAmount.value = '';
    updateUI();
  });

  btnClose.addEventListener('click', e => {
    e.preventDefault();
    if (
      inputCloseUsername.value == currentAccount.username &&
      Number(inputClosePin.value) == currentAccount.pin
    ) {
      closeAccount(currentAccount);
      logoutUser();
    }
    inputCloseUsername.value = inputClosePin.value = '';
  });

  btnLoan.addEventListener('click', e => {
    e.preventDefault();
    requestLoan(currentAccount, Number(inputLoanAmount.value));

    inputLoanAmount.value = '';
    updateUI();
  });

  btnSort.addEventListener('click', e => {
    e.preventDefault();
    isMovementsSorted = !isMovementsSorted;
    displayMovements(currentAccount.movements, isMovementsSorted);
  });
};

init();
