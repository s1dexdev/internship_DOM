const restPositions = {
    1: 'manager',
    2: 'barman',
    3: 'cook',
    4: 'waiter',
};

const restDepartments = [
    {
        title: 'Bar',
        departmentId: '1',
        employees: [
            {
                name: 'James',
                surname: 'James',
                departmentId: '1',
                position: restPositions[1],
                salary: 5000,
                isFired: false,
            },
            {
                name: 'Robert',
                surname: 'Robert',
                departmentId: '1',
                position: restPositions[2],
                salary: 3000,
                isFired: false,
            },
            {
                name: 'John',
                surname: 'John',
                departmentId: '1',
                position: restPositions[2],
                salary: 3000,
                isFired: false,
            },
        ],
    },
    {
        title: 'Cook',
        departmentId: '2',
        employees: [
            {
                name: 'Mary',
                surname: 'Mary',
                departmentId: '2',
                position: restPositions[1],
                salary: 6000,
                isFired: false,
            },
            {
                name: 'Patricia',
                surname: 'Patricia',
                departmentId: '2',
                position: restPositions[3],
                salary: 4000,
                isFired: false,
            },
            {
                name: 'Jennifer',
                surname: 'Jennifer',
                departmentId: '2',
                position: restPositions[3],
                salary: 4000,
                isFired: false,
            },
            {
                name: 'Jennifer',
                surname: 'Jennifer',
                departmentId: '2',
                position: restPositions[3],
                salary: 4000,
                isFired: false,
            },
        ],
    },
    {
        title: 'Hall',
        departmentId: '3',
        employees: [
            {
                name: 'Michael',
                surname: 'Michael',
                departmentId: '2',
                position: restPositions[1],
                salary: 3000,
                isFired: false,
            },
            {
                name: 'Linda',
                surname: 'Linda',
                departmentId: '2',
                position: restPositions[3],
                salary: 1000,
                isFired: false,
            },
            {
                name: 'Elizabeth',
                surname: 'Elizabeth',
                departmentId: '2',
                position: restPositions[3],
                salary: 1000,
                isFired: false,
            },
            {
                name: 'Elizabeth',
                surname: 'Elizabeth',
                departmentId: '2',
                position: restPositions[3],
                salary: 1000,
                isFired: false,
            },
            {
                name: 'Elizabeth',
                surname: 'Elizabeth',
                departmentId: '2',
                position: restPositions[3],
                salary: 1000,
                isFired: true,
            },
        ],
    },
];

export { restPositions, restDepartments };
