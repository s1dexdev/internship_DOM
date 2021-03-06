import { bankClients } from './db.js';

class Bank {
    #wrapper;
    #clients;
    #genId;

    constructor(selector, bankClients) {
        this.#wrapper = document.querySelector(selector);
        this.#clients = bankClients || [];
        this.#genId = 1;

        this.render();
    }

    render() {
        const bank = this.createMarkupBank();

        this.#wrapper.innerHTML = '';
        this.#wrapper.appendChild(bank);
    }

    createMarkupBank() {
        const bank = document.createElement('DIV');

        bank.classList.add('bank-wrapper');
        bank.insertAdjacentHTML(
            'afterbegin',
            `
            <p>Total amount in the bank: <span class="total-amount"></span></p>
            <p>Owe to the bank: <span class="owe-amount"></span></p>
            <p>Number of debtors: <span class="debtors"></span></p>
            <button class="add-client-btn" type="button" data-action="setClientForm">Add new client</button>
        `,
        );

        bank.appendChild(this.createMarkupClientCard());
        bank.addEventListener('click', event => {
            const { action } = event.target.dataset;

            this[action](event);
        });

        this.getAmountTotal('USD', 'UAH').then(data => {
            this.#wrapper.querySelector(
                '.total-amount',
            ).textContent = `${data}$`;
        });

        this.getAmountClientsOwe('USD', 'UAH').then(
            ({ amount, numberDebtors }) => {
                this.#wrapper.querySelector(
                    '.owe-amount',
                ).textContent = `${amount}$`;
                this.#wrapper.querySelector(
                    '.debtors',
                ).textContent = `${numberDebtors}`;
            },
        );

        return bank;
    }

    createMarkupClientCard() {
        const clientsList = document.createElement('UL');

        clientsList.classList.add('clients-list');
        this.#clients.forEach(
            ({ name, surname, id, registrationDate, accounts }) => {
                const client = document.createElement('LI');

                client.classList.add('client-item');
                client.innerHTML = `
                <div class="client-info">
                    <p>Name: ${name} ${surname}</p>
                    <p>Registration date: ${registrationDate}</p>
                </div>
                <button type="button" data-action="setAccountForm">Add new account</button>
                <button type="button" data-action="deleteClient" data-id=${id}>Delete client</button>
                <p>Accounts: </p>
                <ul class="client-accounts"></ul>
            `;

                const clientAccounts = client.querySelector('.client-accounts');

                accounts.forEach(account =>
                    clientAccounts.appendChild(
                        this.createMarkupClientAccount(account),
                    ),
                );

                clientsList.appendChild(client);
            },
        );

        return clientsList;
    }

    createMarkupClientAccount(account) {
        const clientAccount = document.createElement('LI');

        clientAccount.classList.add('client-account');
        clientAccount.innerHTML = `
                        <p>Account number: ${account.id}</p>
                        <p>Type: ${account.type}</p>
                        <p>Currency: ${account.currency}</p>
                        <p>Expiry date: ${account.expiryDate}</p>
                    `;

        if (account.type === 'debit') {
            clientAccount.insertAdjacentHTML(
                'beforeend',
                `
                <p>Balance: ${account.balance}</p>
                `,
            );
        }

        if (account.type === 'credit') {
            clientAccount.insertAdjacentHTML(
                'beforeend',
                `
                <p>Credit limit: ${account.creditLimit}</p>
                <p>Balance: ${account.balance.own + account.balance.credit}</p>
                `,
            );
        }

        return clientAccount;
    }

    createModal(props) {
        let isFlag = false;
        const modal = {
            open() {
                if (isFlag) {
                    return;
                }

                modalWindowMarkup.classList.add('open');
            },
            close() {
                modalWindowMarkup.classList.remove('open');
            },
            deleteMarkup() {
                modalWindowMarkup.parentNode.removeChild(modalWindowMarkup);
                modalWindowMarkup.removeEventListener('click', listener);
                window.removeEventListener('keydown', listener);

                isFlag = true;
            },
        };

        const modalWindowMarkup = this.createMarkupModal(props);

        function listener(event) {
            if (event.target.dataset.close || event.code === 'Escape') {
                modal.close();
                modal.deleteMarkup();
            }
        }

        modalWindowMarkup.addEventListener('click', listener);
        window.addEventListener('keydown', listener);

        return modal;
    }

    createMarkupModal(props) {
        const container = document.createElement('div');

        container.classList.add('modal');
        container.insertAdjacentHTML(
            'afterbegin',
            `
                <div class="modal-overlay" data-close="true">
                    <div class="modal-window">
                        <span class="modal-close" data-close="true">&times;</span>

                    </div>
                </div>
                `,
        );

        const modalWindow = container.querySelector('.modal-window');

        modalWindow.appendChild(this.createMarkupForm(props));
        this.#wrapper.appendChild(container);

        return container;
    }

    createMarkupForm({ id, formName, inputs }) {
        const form = document.createElement('FORM');

        form.classList.add('form');
        form.setAttribute('data-action', formName);

        for (let i = 0; i < inputs.length; i++) {
            const input = document.createElement('INPUT');

            for (let key in inputs[i]) {
                input.setAttribute(key, inputs[i][key]);
            }

            form.appendChild(input);
        }

        form.insertAdjacentHTML(
            'beforeend',
            `
            <button type="submit" data-action="accept" data-id=${id}>Add</button>
        `,
        );

        form.addEventListener('submit', event => {
            event.preventDefault();

            this.handleForm(event);
        });

        return form;
    }

    handleForm(event) {
        const { action } = event.target.dataset;
        const data = new FormData(event.target);
        const result = {};

        for (let item of data.entries()) {
            let key = item[0];
            let value = item[1];

            result[key] = value;
        }

        this[action](result);
        this.render();
    }

    addClient(client) {
        client.id = String(this.#genId);
        client.isActive = true;
        client.registrationDate = new Date().toLocaleDateString();
        client.accounts = [];

        this.#clients.push(client);
        this.#genId++;

        return true;
    }

    addClientAccount({ id, type, currency }) {
        const client = this.findClientById(id);
        let account = {
            type,
            number: this.#genId,
            balance: null,
            expiryDate: this.setExpiryDateClientCard(1, 3),
            currency,
            isActive: true,
        };

        if (client === undefined) {
            return null;
        }

        if (type === 'debit') {
            account.balance = 0;
        }

        if (type === 'credit') {
            account.creditLimit = 10000;
            account.balance = { own: 0, credit: account.creditLimit };
        }

        client.accounts.push(account);
        this.#genId++;

        return client;
    }

    deleteClient(event) {
        const clientId = event.target.dataset.id;

        this.#clients = this.#clients.filter(({ id }) => clientId !== id);
        this.render();
    }

    setClientForm() {
        this.createModal({
            formName: 'addClient',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'name',
                    class: 'input',
                    pattern: '[a-zA-Z]{2,10}',
                },
                {
                    name: 'surname',
                    type: 'text',
                    placeholder: 'surname',
                    class: 'input',
                    pattern: '[a-zA-Z]{2,10}',
                },
            ],
        }).open();
    }

    setAccountForm(event) {
        const { id } = event.target.dataset;

        this.createModal({
            id,
            formName: 'addClientAccount',
            inputs: [
                {
                    name: 'type',
                    type: 'text',
                    placeholder: 'account type',
                    class: 'input',
                    pattern: '[a-z]{5,6}',
                },
                {
                    name: 'currency',
                    placeholder: 'currency type',
                    type: 'text',
                    class: 'input',
                    pattern: '[a-z]{2,3}',
                },
            ],
        }).open();
    }

    findClientById(id) {
        return this.#clients.find(client => client.id === id);
    }

    setExpiryDateClientCard(month, year) {
        const date = new Date();

        return `${date.getMonth() + month}/${date.getFullYear() + year}`;
    }

    conversionCurrency(
        rates,
        currency,
        amount,
        baseCurrencyBank,
        baseCurrencyCountry,
    ) {
        let result = null;
        let baseCurrencyRate = rates.find(
            ({ ccy }) => ccy === baseCurrencyBank,
        );

        if (currency === baseCurrencyCountry) {
            result = amount / baseCurrencyRate.sale;

            return Math.round(result * 100) / 100;
        }

        rates.forEach(({ ccy, buy }) => {
            if (currency === ccy) {
                result = (amount * buy) / baseCurrencyRate.sale;

                return result;
            }
        });

        return Math.round(result * 100) / 100;
    }

    async getAmountTotal(baseCurrencyBank, baseCurrencyCountry) {
        const currencyRates = await this.getCurrencyRates();

        return this.#clients.reduce((result, { accounts }) => {
            accounts.forEach(account => {
                let { type, currency, balance } = account;

                if (type === 'debit') {
                    if (currency === baseCurrencyBank) {
                        result += balance;

                        return account;
                    }

                    result += this.conversionCurrency(
                        currencyRates,
                        currency,
                        balance,
                        baseCurrencyBank,
                        baseCurrencyCountry,
                    );

                    return account;
                }

                if (account.type === 'credit') {
                    let { own, credit } = account.balance;
                    let totalAmount = own + credit;

                    if (currency === baseCurrencyBank) {
                        result += totalAmount;

                        return account;
                    }

                    result += this.conversionCurrency(
                        currencyRates,
                        currency,
                        totalAmount,
                        baseCurrencyBank,
                        baseCurrencyCountry,
                    );

                    return account;
                }
            });

            return result;
        }, 0);
    }

    async getAmountClientsOwe(mainCurrencyBank, mainCurrencyCountry) {
        const currencyRates = await this.getCurrencyRates();

        return this.#clients.reduce(
            (accumulator, { isActive, accounts }, index) => {
                if (index === 0) {
                    accumulator.amount = 0;
                    accumulator.numberDebtors = 0;
                }

                const totalDebt = accounts.reduce((acc, account) => {
                    let { type, currency } = account;

                    if (type === 'credit') {
                        let loanAmount =
                            account.creditLimit - account.balance.credit;

                        if (loanAmount < 0) {
                            return acc;
                        }

                        if (currency === mainCurrencyBank) {
                            acc += loanAmount;

                            return acc;
                        }

                        acc += this.conversionCurrency(
                            currencyRates,
                            currency,
                            loanAmount,
                            mainCurrencyBank,
                            mainCurrencyCountry,
                        );

                        return acc;
                    }

                    return acc;
                }, 0);

                if (totalDebt > 0) {
                    accumulator.numberDebtors++;
                }

                accumulator.amount += totalDebt;

                return accumulator;
            },
            {},
        );
    }

    async getCurrencyRates(handleError) {
        const url =
            'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

        try {
            const response = await fetch(url);
            const rates = await response.json();

            return rates;
        } catch (error) {
            handleError(error);
        }
    }
}

document.addEventListener('DOMContentLoaded', event => {
    new Bank('.app', bankClients);
});
