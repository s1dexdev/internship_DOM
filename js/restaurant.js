import { restPositions, restDepartments } from './db.js';

class Restaurant {
    #wrapper;
    #departments;
    #positionsId;

    constructor(selector, positions, departments) {
        this.#wrapper = document.querySelector(selector);
        this.#departments = departments || [];
        this.#positionsId = positions || {};

        this.render();
    }

    render() {
        const restaurant = this.createMarkupRestaurant();

        this.#wrapper.innerHTML = '';
        this.#wrapper.appendChild(restaurant);
    }

    createMarkupRestaurant() {
        const restaurant = document.createElement('DIV');

        restaurant.innerHTML = `
            <div class="buttons">
                <button type="button" data-action="setDepartmentForm">Add new department</button>
                <button type="button" data-action="setEmployeeForm">Add new employee</button>
            </div>
            <p class="text-title">General info:</p>
            <ul>
                <li>
                    <p>Number of employees: ${this.getNumberEmployees(
                        employee => employee,
                    )}</p>
                </li>
                <li>
                    <p>Number of fired employees: ${this.getNumberEmployees(
                        ({ isFired }) => isFired === true,
                    )}</p>
                </li>
            </ul>
            <p class="text-title">Departments info:</p>
                   
        `;

        restaurant.appendChild(this.createMarkupDepartment());
        restaurant.addEventListener('click', event => {
            const { action } = event.target.dataset;

            this[action](event);
        });

        return restaurant;
    }

    createMarkupDepartment() {
        const salaryInfo = this.getAmountSalaryTotal(salary => salary);
        const departmentsList = document.createElement('UL');

        departmentsList.classList.add('departments');

        for (let i = 0; i < this.#departments.length; i++) {
            const { title, departmentId } = this.#departments[i];
            const item = document.createElement('LI');

            item.classList.add('departments-item');
            item.innerHTML = `
                <p>Department title - ${title}</p>
                <p>Department number: ${departmentId}</p>
                <p>Total salary by department: ${salaryInfo[title]}</p>
                <button type="button" data-action="deleteDepartment" data-number=${departmentId}>Delete</button>
            `;

            departmentsList.appendChild(item);
        }

        return departmentsList;
    }

    createMarkupForm(props) {
        const { formName, inputs } = props;
        const form = document.createElement('FORM');

        form.classList.add('form');
        form.setAttribute('data-name', formName);

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
            <button type="submit" data-action="accept">Add</button>
        `,
        );

        form.addEventListener('submit', event => {
            event.preventDefault();

            this.handleForm(event);
        });

        return form;
    }

    handleForm(event) {
        const { name } = event.target.dataset;
        const data = new FormData(event.target);
        const result = {};

        for (let item of data.entries()) {
            let key = item[0];
            let value = item[1];

            if (key === 'salary') {
                value = Number(value);
            }

            result[key] = value;
        }

        this[name](result);
        this.render();
    }

    setDepartmentForm() {
        this.createModal({
            formName: 'createDepartment',
            inputs: [
                {
                    name: 'title',
                    type: 'text',
                    placeholder: 'title',
                    class: 'input',
                    pattern: '[a-zA-Z]{5,10}',
                },
                {
                    name: 'departmentId',
                    type: 'number',
                    placeholder: 'department number',
                    class: 'input',
                    pattern: '[0-9]{1,10}',
                },
            ],
        });
    }

    setEmployeeForm() {
        this.createModal({
            formName: 'createEmployee',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'name',
                    class: 'input',
                    pattern: '[a-zA-Z]{2,}',
                },
                {
                    name: 'surname',
                    type: 'text',
                    placeholder: 'surname',
                    class: 'input',
                    pattern: '[a-zA-Z]{2,}',
                },
                {
                    name: 'departmentId',
                    type: 'number',
                    placeholder: 'departmentId',
                    class: 'input',
                    pattern: '[0-9]{1,10}',
                },
                {
                    name: 'position',
                    type: 'number',
                    placeholder: 'position number',
                    class: 'input',
                    pattern: '[0-9]{1,10}',
                },
                {
                    name: 'salary',
                    type: 'number',
                    placeholder: 'salary',
                    class: 'input',
                    pattern: '[0-9]{1,10}',
                },
            ],
        }).open();
    }

    createModal(props) {
        props = props || null;

        let isFlag = false;
        const modalWindowMarkup = this.createMarkupModal(props);
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

    deleteDepartment(event) {
        const id = event.target.dataset.number;

        this.#departments = this.#departments.filter(
            ({ departmentId }) => departmentId !== id,
        );

        this.render();
    }

    findDepartment(id) {
        return this.#departments.find(
            ({ departmentId }) => departmentId === id,
        );
    }

    createDepartment(department) {
        const checkDepartment = this.findDepartment(department.departmentId);

        if (checkDepartment) {
            return false;
        }

        department.employees = [];
        this.#departments.push(department);

        return department;
    }

    createEmployee(employee) {
        const checkDepartment = this.findDepartment(employee.departmentId);

        if (checkDepartment) {
            employee.position = this.#positionsId[employee.position];
            employee.isFired = false;

            checkDepartment.employees.push(employee);

            return employee;
        }

        return null;
    }

    getAmountSalaryTotal(callback) {
        return this.#departments.reduce((acc, { title, employees }) => {
            let counterPersons = 0;
            let salaryInfo = employees.reduce(
                (accumulator, { salary, isFired }) => {
                    if (!isFired) {
                        accumulator += salary;
                        counterPersons++;
                    }

                    return accumulator;
                },
                0,
            );

            acc[title] = callback(salaryInfo, counterPersons);

            return acc;
        }, {});
    }

    getAmountSalaryDetail() {
        return this.#departments.reduce((acc, { title, employees }) => {
            let salaryInfo = employees.reduce(
                (accumulator, { position, salary, isFired }) => {
                    if (!isFired) {
                        if (!accumulator[position]) {
                            accumulator[position] = {
                                maxSalary: salary,
                                minSalary: salary,
                            };
                        }

                        if (accumulator[position].maxSalary < salary) {
                            accumulator[position].maxSalary = salary;
                        }

                        if (accumulator[position].minSalary > salary) {
                            accumulator[position].minSalary = salary;
                        }
                    }

                    return accumulator;
                },
                {},
            );

            acc[title] = salaryInfo;

            return acc;
        }, {});
    }

    getNumberEmployees(callback) {
        let counter = 0;

        this.#departments.forEach(({ employees }) =>
            employees.forEach(employee => {
                if (callback(employee)) {
                    counter++;
                }
            }),
        );

        return counter;
    }

    findDepartmentWithoutHead(positionId) {
        const result = this.#departments.reduce((acc, department) => {
            let counter = 0;

            department.employees.forEach(({ position }) => {
                if (position === this.#positionsId[positionId]) {
                    counter++;
                }
            });

            if (counter === 0) {
                acc.push(department);
            }

            return acc;
        }, []);

        return result;
    }
}

document.addEventListener('DOMContentLoaded', event => {
    new Restaurant('.app', restPositions, restDepartments);
});
