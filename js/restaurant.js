import { restPositions, restDepartments } from './dbRest.js';

class Restaurant {
    #wrapper;
    #title;
    #departments;
    #positionsId;

    constructor(selector, title, positions, departments) {
        this.#wrapper = document.querySelector(selector);
        this.#title = title;
        this.#departments = departments || [];
        this.#positionsId = positions || {};

        this.render();
    }

    render() {
        const restaurant = this.createRestaurantMarkup();

        this.#wrapper.appendChild(restaurant);
    }

    createRestaurantMarkup() {
        const restaurant = document.createElement('LI');
        const restTitle = document.createElement('P');
        const depart = document.createElement('SPAN');
        const departments = document.createElement('UL');

        for (let i = 0; i < this.#departments.length; i++) {
            const { title } = this.#departments[i];
            const item = document.createElement('LI');

            item.classList.add('list-item');
            item.textContent = title;
            departments.appendChild(item);
        }

        restTitle.textContent = `Title: ${this.#title}`;
        depart.textContent = `Departments: `;

        restaurant.appendChild(restTitle);
        restaurant.appendChild(depart);
        restaurant.appendChild(departments);

        return restaurant;
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

                        return accumulator;
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

                        return accumulator;
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

function createListRest(selector) {
    const list = document.createElement('UL');

    list.classList.add('list');
    selector.appendChild(list);

    return list;
}

document.addEventListener('DOMContentLoaded', event => {
    const app = document.querySelector('.app');

    createListRest(app);

    const a = new Restaurant('.list', 'Lion', restPositions, restDepartments);
    const b = new Restaurant('.list', 'Rogt', restPositions, restDepartments);
    const c = new Restaurant('.list', 'Zyre', restPositions, restDepartments);

    console.log(a);
});
