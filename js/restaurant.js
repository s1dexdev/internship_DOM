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
    }

    render() {
        const restaurant = this.createRestaurantMarkup();

        restaurant.addEventListener('click', this.handleClick.bind(this));
        this.#wrapper.appendChild(restaurant);
    }

    createRestaurantMarkup() {
        const restaurant = document.createElement('DIV');
        const salaryInfo = this.getAmountSalaryTotal(salary => salary);
        const salaryInfoDetail = this.getAmountSalaryDetail();

        restaurant.innerHTML = `
            <img src="https://amc.ua/images/image-not-found.jpg" width="300" alt="Restaurant photo" />
            <p>Departments info: </p>
            <ul class="departments"></ul>
            <p>General info</p>
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
            <div>
                <button type="button" data-action="edit">Edit</button>
                <button type="button" data-action="delete">Delete restaurant</button>
            </div>
            
        `;

        const departmentsList = restaurant.querySelector('.departments');

        for (let i = 0; i < this.#departments.length; i++) {
            const { title } = this.#departments[i];
            const item = document.createElement('LI');

            item.innerHTML = `
                <p>Department title - ${title}</p>
                <p>Total salary by department: ${salaryInfo[title]}</p>
                <ul class="detail-salary"></ul>
            `;

            for (let item in salaryInfoDetail) {
                const item = document.createElement('LI');

                for (let key in item) {
                    item.innerHTML = `
                        <p>${item[key]}</p>
                    `;
                }
            }

            departmentsList.appendChild(item);
        }

        return restaurant;
    }

    handleClick(event) {
        event.preventDefault();

        const action = event.target.dataset.action;

        switch (action) {
            case 'edit':
                this.editRestaurantInfo(event);
                break;
            case 'delete':
                this.#wrapper.removeChild(event.currentTarget);
                break;
            default:
                return;
        }
    }

    editRestaurantInfo(event) {
        this.modal().open();
    }

    modal() {
        let isFlag = false;
        const modalWindowMarkup = this.createModal();
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

        const listener = event => {
            if (event.target.dataset.close || event.code === 'Escape') {
                modal.close();
                modal.destroy();
            }
        };

        modalWindowMarkup.addEventListener('click', listener);
        window.addEventListener('keydown', listener);

        return modal;
    }

    createModal() {
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

        // container.querySelector('.modal-window').appendChild(markup);
        document.body.appendChild(container);

        return container;
    }

    findDepartment(id) {
        return this.#departments.find(department => department.id === id);
    }

    createDepartment(title, id) {
        try {
            const checkDepartment = this.findDepartment(id);

            if (checkDepartment) {
                throw new Error(
                    'Sorry, but department with such id already exist.',
                );
            }

            const newDepartment = { title, id, employees: [] };

            this.#departments.push(newDepartment);

            return newDepartment;
        } catch (error) {
            return error;
        }
    }

    addEmployee(employee) {
        const checkDepartment = this.findDepartment(employee.departmentId);

        if (checkDepartment) {
            employee.position = this.#positionsId[employee.position];
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
