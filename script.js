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
  movements: [
    { created: '2023-01-11T18:43:51.826Z', amount: 200 },
    { created: '2023-01-11T18:43:51.826Z', amount: 450 },
    { created: '2023-01-11T18:43:51.826Z', amount: -400 },
    { created: '2023-01-11T18:43:51.826Z', amount: 3000 },
    { created: '2023-02-03T18:43:51.826Z', amount: -650 },
    { created: '2023-02-05T18:43:51.826Z', amount: -130 },
    { created: '2023-02-09T18:43:51.826Z', amount: 70 },
    { created: '2023-02-10T18:43:51.826Z', amount: 1300 },
  ],
  interestRate: 1.2, // %
  pin: 1111,
  locale: 'en-US',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    { created: '2023-02-11T18:43:51.826Z', amount: 5000 },
    { created: '2023-02-11T18:43:51.826Z', amount: 3400 },
    { created: '2023-02-11T18:43:51.826Z', amount: -150 },
    { created: '2023-02-11T18:43:51.826Z', amount: -790 },
    { created: '2023-02-11T18:43:51.826Z', amount: -3210 },
    { created: '2023-02-11T18:43:51.826Z', amount: -1000 },
    { created: '2023-02-11T18:43:51.826Z', amount: 8500 },
    { created: '2023-02-11T18:43:51.826Z', amount: -30 },
  ],
  interestRate: 1.5,
  pin: 2222,
  locale: 'uk-UA',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [
    { created: '2023-02-11T18:43:51.826Z', amount: 200 },
    { created: '2023-02-11T18:43:51.826Z', amount: -200 },
    { created: '2023-02-11T18:43:51.826Z', amount: 340 },
    { created: '2023-02-11T18:43:51.826Z', amount: -300 },
    { created: '2023-02-11T18:43:51.826Z', amount: -20 },
    { created: '2023-02-11T18:43:51.826Z', amount: 50 },
    { created: '2023-02-11T18:43:51.826Z', amount: 400 },
    { created: '2023-02-11T18:43:51.826Z', amount: -460 },
  ],
  interestRate: 0.7,
  pin: 3333,
  locale: 'de-DE',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [
    { created: '2023-02-11T18:43:51.826Z', amount: 430 },
    { created: '2023-02-11T18:43:51.826Z', amount: 1000 },
    { created: '2023-02-11T18:43:51.826Z', amount: 700 },
    { created: '2023-02-11T18:43:51.826Z', amount: 50 },
    { created: '2023-02-11T18:43:51.826Z', amount: 90 },
  ],
  interestRate: 1,
  pin: 4444,
  locale: 'en-GB',
};

const accounts = [account1, account2, account3, account4];
let currentAccount = undefined;
let isMovementsSorted = false;

const formatDate = function (date, locale) {
  const options = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, options).format(date);
};

const formatTime = function (date, locale) {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, options).format(date);
};

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

const formatMovementDate = function (date, locale) {
  const calDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysPassed = calDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return formatDate(date, locale);
};

const displayMovements = function (movements, locale, sorted) {
  let movs = sorted
    ? movements.slice().sort((a, b) => a.amount - b.amount)
    : movements;

  containerMovements.innerHTML = '';
  movs.forEach((mov, i) => {
    const type = mov.amount > 0 ? 'deposit' : 'withdrawal';

    const movRow = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${formatMovementDate(
      new Date(mov.created),
      locale
    )}</div>
    <div class="movements__value">${mov.amount.toFixed(2)}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', movRow);
  });
};
const updBalance = function (account) {
  return (account.balance = account.movements.reduce(
    (acc, mov) => acc + mov.amount,
    0
  ));
};

const displaySummary = function (movements) {
  let incomesTotal = 0,
    outocomesTotal = 0,
    interestRate = 0;
  let movAmounts = movements.flatMap(mov => mov.amount);

  /* Can be done with chaining filter() and reduce(),
  but in this case we will need to iterate throuth the array 4 times */
  movAmounts.forEach(mov => {
    mov > 0 ? (incomesTotal += mov) : (outocomesTotal += mov);
  });

  interestRate = movAmounts
    .filter(mov => mov > 0)
    .map(deposit => (deposit * 1.2) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, el) => acc + el, 0);

  labelSumIn.textContent = `${incomesTotal.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(outocomesTotal).toFixed(2)}€`;
  labelSumInterest.textContent = `${interestRate.toFixed(2)}€`;
};

const updateUI = function () {
  const now = new Date();

  labelDate.textContent =
    formatDate(now, currentAccount.locale) +
    ' ' +
    formatTime(now, currentAccount.locale);

  displayMovements(currentAccount.movements, currentAccount.locale, false);
  labelBalance.textContent = `${updBalance(currentAccount).toFixed(2)} EUR`;
  displaySummary(currentAccount.movements);
};

const transferMoney = function (accountFrom, accountTo, amount) {
  if (!accountFrom || !accountTo || amount <= 0 || amount > accountFrom.balance)
    return;
  let now = new Date().toISOString();

  accountFrom.movements.push({ created: now, amount: -amount });
  accountTo.movements.push({ created: now, amount: amount });
};

const requestLoan = function (account, amount) {
  if (amount > 0 && account.movements.some(mov => mov.amount >= amount * 0.1)) {
    let now = new Date().toISOString();
    account.movements.push({ created: now, amount: amount });
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
    displayMovements(
      currentAccount.movements,
      currentAccount.locale,
      isMovementsSorted
    );
  });
};

init();
