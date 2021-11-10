import { restPositions, restDepartments } from './dbRest.js';

class Restaurant {
    #wrapper;
    #departments;
    #positionsId;

    constructor(selector, positions, departments) {
        this.#wrapper = document.querySelector(selector);
        this.#departments = departments || [];
        this.#positionsId = positions || {};

        this.render();
        console.log(this);
    }

    render() {
        const restaurant = this.createRestaurantMarkup();

        this.#wrapper.innerHTML = '';
        this.#wrapper.appendChild(restaurant);
        restaurant.addEventListener('click', this.handleClick.bind(this));
    }

    createRestaurantMarkup() {
        const restaurant = document.createElement('DIV');
        const salaryInfo = this.getAmountSalaryTotal(salary => salary);

        restaurant.innerHTML = `
            <div class="buttons">
                <button type="button" data-action="department">Add new department</button>
                <button type="button" data-action="employee">Add new employee</button>
            </div>
            <p>Departments info:</p>
            <ul class="departments"></ul>
            <p>General info:</p>
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
         
            
        `;

        const departmentsList = restaurant.querySelector('.departments');

        for (let i = 0; i < this.#departments.length; i++) {
            const { title, departmentId } = this.#departments[i];
            const item = document.createElement('LI');

            item.classList.add('item');
            item.innerHTML = `
                <p>Department title - ${title}</p>
                <p>Department number: ${departmentId}</p>
                <p>Total salary by department: ${salaryInfo[title]}</p>
                <button type="button" data-action="delete" data-number=${departmentId}>Delete</button>
            `;

            departmentsList.appendChild(item);
        }

        return restaurant;
    }

    handleClick(event) {
        event.preventDefault();

        const action = event.target.dataset.action;

        switch (action) {
            case 'department':
                this.createModal({
                    formName: 'department',
                    inputs: [
                        {
                            name: 'title',
                            type: 'text',
                            placeholder: 'title',
                            class: 'input',
                        },
                        {
                            name: 'departmentId',
                            type: 'number',
                            placeholder: 'department number',
                            class: 'input',
                        },
                    ],
                }).open();

                break;
            case 'employee':
                this.createModal({
                    formName: 'employee',
                    inputs: [
                        {
                            name: 'name',
                            type: 'text',
                            placeholder: 'name',
                            class: 'input',
                        },
                        {
                            name: 'surname',
                            type: 'text',
                            placeholder: 'surname',
                            class: 'input',
                        },
                        {
                            name: 'departmentId',
                            type: 'number',
                            placeholder: 'departmentId',
                            class: 'input',
                        },
                        {
                            name: 'position',
                            type: 'number',
                            placeholder: 'position number',
                            class: 'input',
                        },
                        {
                            name: 'salary',
                            type: 'number',
                            placeholder: 'salary',
                            class: 'input',
                        },
                    ],
                }).open();
                break;
            case 'delete':
                this.deleteDepartment(event);
                break;
            default:
                return;
        }
    }

    deleteDepartment(event) {
        const department = event.target.dataset.number;

        this.#departments = this.#departments.filter(
            ({ number }) => number !== department,
        );
        this.render();
    }

    createForm({ formName, inputs }) {
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

        if (event.target.dataset.name === 'department') {
            this.createDepartment(result);
        }

        if (event.target.dataset.name === 'employee') {
            this.addEmployee(result);
        }

        this.render();
    }

    createModal(props) {
        props = props || null;

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
            destroy() {
                modalWindowMarkup.parentNode.removeChild(modalWindowMarkup);
                modalWindowMarkup.removeEventListener('click', listener);
                window.removeEventListener('keydown', listener);

                isFlag = true;
            },
        };

        const modalWindowMarkup = createMarkupModal(this);

        function listener(event) {
            if (event.target.dataset.close || event.code === 'Escape') {
                modal.close();
                modal.destroy();
            }
        }

        function createMarkupModal(restaurant) {
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

            if (props) {
                const modalWindow = container.querySelector('.modal-window');

                modalWindow.appendChild(restaurant.createForm(props));
            }

            restaurant.#wrapper.appendChild(container);

            return container;
        }

        modalWindowMarkup.addEventListener('click', listener);
        window.addEventListener('keydown', listener);

        return modal;
    }

    findDepartment(id) {
        return this.#departments.find(
            ({ departmentId }) => departmentId === id,
        );
    }

    createDepartment(department) {
        try {
            const checkDepartment = this.findDepartment(
                department.departmentId,
            );

            if (checkDepartment) {
                throw new Error(
                    'Sorry, but department with such id already exist.',
                );
            }

            department.employees = [];
            this.#departments.push(department);

            return department;
        } catch (error) {
            console.log(error);
        }
    }

    addEmployee(employee) {
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
    const app = document.querySelector('.app');

    const a = new Restaurant('.app', restPositions, restDepartments);

    // console.log(a);
});
