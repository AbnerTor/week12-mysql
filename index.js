const inquirer = require("inquirer");
const mysql = require("mysql");
const express = require('express')
const ctable = require("console.table")
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sets the information necessary to connect to the server
const connection = mysql.createConnection({
    host: 'localhost',

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: 'root',

    // Be sure to update with your own MySQL password!
    password: 'Boomer/Chan65',
    database: 'employee_tracker_db',
});



const promptUser = () => {
    inquirer.prompt({
        type: "list",
        name: "promptUser",
        message: "What would you like to do?",
        choices: ["View All Employees", "Add Employee", "Add Department", "View Departments", "Add Employee Role", "View Employee Roles", "Update Employee Role", "Delete Employee", "View a Department's Budget", "Exit Application"],
    })
        .then((answer) => {
            switch (answer.promptUser) {
                case "Add Employee":
                    addEmployee();
                    break;

                case "View All Employees":
                    viewEmployees();
                    break;

                case "Add Department":
                    addDept();
                    break;

                case "View Departments":
                    viewDepartments();
                    break;

                case "Add Employee Role":
                    addRole();
                    break;

                case "View Employee Roles":
                    viewRoles();
                    break;

                case "Update Employee Role":
                    updateEmployeeRole();
                    break;

                case "Remove an Employee":
                    removeEmployee();
                    break;

                case "View Department Budget":
                    viewDeptBudget();
                    break;

                case "Exit Application":
                    connection.end();
                    break;
            }

        });
}



const addEmployee = () => {

    let empFirstName;
    let empLastName;
    inquirer.prompt([
        {
            name: "empFirstName",
            type: "input",
            message: "What is this employee's first name?",
            validate: function (answer) {
                if (answer === "") {
                    console.log("Employee must have a first name.");
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            name: "empLastName",
            type: "input",
            message: "What is this employee's last name?",
            validate: function (answer) {
                if (answer === "") {
                    console.log("Employee must have a last name.");
                    return false;
                } else {
                    return true;
                }
            }
        },
    ]).then((answer) => {
        empFirstName = answer.empFirstName;
        empLastName = answer.empLastName;

        connection.query(`SELECT id, title FROM role`, (err, res) => {
            if (err) {
                console.log(error);
            } else {
                let roleArr = [];
                let roleMap = {};
                let selectedRoleId;
                let selectedRole;
                for (i = 0; i < res.length; i++) {
                    let roleTitle = res[i].title;
                    roleArr.push(roleTitle);
                    roleMap[roleTitle] = res[i].id;
                }
                inquirer.prompt([
                    {
                        name: "empRole",
                        type: "list",
                        message: "What is this employee's role?",
                        choices: roleArr
                    },
                ]).then((answer) => {
                    selectedRoleId = roleMap[answer.empRole];
                    selectedRole = answer.empRole;
                    connection.query(
                        `SELECT e.id, e.first_name, e.last_name 
                FROM employee AS e`
                        , (err, res) => {
                            if (err) {
                                console.log(error);
                            } else {
                                let managerArr = [];
                                let managerMap = {};
                                let managerName;
                                for (i = 0; i < res.length; i++) {
                                    managerName = res[i].first_name + " " + res[i].last_name;
                                    managerArr.push(managerName);
                                    managerMap[managerName] = res[i].id;
                                }
                                inquirer.prompt([
                                    {
                                        name: "empManager",
                                        type: "list",
                                        message: "Who is employee's manager?",
                                        choices: [...managerArr, ""]
                                    }
                                ]).then((answer) => {
                                    if (answer.empManager === "") {
                                        managerMap[answer.empManager] = null;
                                    }
                                    connection.query(
                                        `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES ("${empFirstName}", "${empLastName}", ${selectedRoleId}, ${managerMap[answer.empManager]})`, (err, res) => {
                                        if (err) throw err;

                                        console.log(`\n ${empFirstName} ${empLastName} has been added to the company as a(n) ${selectedRole}.\n `);
                                        promptUser();
                                    })
                                })
                            }
                        })
                })
            }
        })
    })

};


const viewEmployees = () => {
    connection.query(
        `SELECT e.id, e.first_name, e.last_name, r.title, r.salary,COALESCE( CONCAT(m.first_name, " ", m.last_name),'') AS manager FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id LEFT JOIN department AS d ON r.department_id = d.id LEFT JOIN employee AS m ON m.id = e.manager_id`, (err, res) => {
            if (err) {
                console.log(error);
            } else {
                console.table(res);
                promptUser();
            }
        })
};

const addDept = () => {
    inquirer.prompt({
        name: "addDepartment",
        type: "input",
        message: "What is this department's name?",
        validate: function (answer) {
            if (answer === "") {
                console.log("The department must have a name.");
                return false;
            } else {
                return true;
            }
        }
    }).then((answer) => {
        connection.query(
            `INSERT INTO department (name)
            VALUES ("${answer.addDepartment}")`, (err, res) => {
            if (err) throw err;

            console.log(`\n ${answer.addDepartment} has been added to the company.\n `);
            promptUser();
        });

    })
};

const viewDepartments = () => {
    connection.query(
        `SELECT * FROM department`, (err, res) => {
            if (err) {
                console.log(error);
            } else {
                console.table(res);
                promptUser();
            }
        })
};

const addRole = () => {
    inquirer.prompt([
        {
            name: "roleTitle",
            type: "input",
            message: "What is this role's title?",
            // Validates that the user did not leave this field blank
            validate: function (answer) {
                if (answer === "") {
                    console.log("Role must have a title.");
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            name: "roleSalary",
            type: "input",
            message: "What is this role's Salary?",
            // Validates that the user input a number 
            validate: function (answer) {
                if (isNaN(answer)) {
                    console.log("Role must have a salary.");
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            name: "departmentID",
            type: "input",
            message: "What department is this role in?",
            // Validates that the user did not leave this field blank
            validate: function (answer) {
                if (answer === "") {
                    console.log("Role must be in a department.");
                    return false;
                } else {
                    return true;
                }
            }
        }
    ]).then((answer) => {
        connection.query(
            `INSERT INTO role (title, salary, department_id)
            SELECT "${answer.roleTitle}", "${answer.roleSalary}", id
            FROM department
            WHERE department.name = "${answer.departmentID}"`, (err, res) => {
            if (err) throw err;

            console.log(`\n ${answer.roleTitle} has been added to the company.\n `);
            promptUser();
        });

    })
};

const viewRoles = () => {
    connection.query(
        `SELECT r.id, r.title, e.first_name, e.last_name
    FROM role AS r
    LEFT JOIN department AS d ON d.id = r.department_id
    LEFT JOIN employee AS e on r.id = e.role_id`, (err, res) => {
        if (err) {
            console.log(error);
        } else {
            console.table(res);
            promptUser();
        }
    })
};

const updateEmployeeRole = () => {
    connection.query(
        `SELECT e.id, e.first_name, e.last_name 
        FROM employee AS e`, (err, res) => {
        if (err) {
            console.log(error);
        } else {
            let empArr = [];
            let empMap = {};
            let selectedEmpId;
            let selectedEmp;

            for (i = 0; i < res.length; i++) {
                let empName = res[i].first_name + " " + res[i].last_name;
                empArr.push(empName);
                empMap[empName] = res[i].id;
            }
            inquirer.prompt([
                {
                    name: "employees",
                    type: "list",
                    message: "Which employee would you like to update?",
                    choices: empArr
                }
            ]).then((answer) => {
                selectedEmpId = empMap[answer.employees];
                console.log(selectedEmpId);
                selectedEmp = answer.employees;

                connection.query(`SELECT title FROM role`, (err, res) => {
                    if (err) {
                        console.log(error);
                    } else {
                        let roleArr = [];
                        let roleMap = {};

                        for (i = 0; i < res.length; i++) {
                            let roleTitle = res[i].title;
                            roleArr.push(roleTitle);
                            roleMap[roleTitle] = res[i].id;
                        }
                        inquirer.prompt([
                            {
                                name: "roleSelection",
                                type: "list",
                                message: "What would you like " + selectedEmp + "'s new role to be?",
                                choices: roleArr
                            }
                        ]).then((answer) => {
                            connection.query(`UPDATE employee SET role_id =(SELECT id FROM role WHERE title = "${answer.roleSelection}") WHERE id = ${selectedEmpId}`)
                            console.log(selectedEmp + ` is now a ${answer.roleSelection}`);
                            promptUser();
                        })
                    }
                })
            })
        };
    });
};




const removeEmployee = () => {
    connection.query(
        `SELECT e.id, e.first_name, e.last_name, r.title, r.salary,COALESCE( CONCAT(m.first_name, " ", m.last_name),'') AS manager FROM employee AS e LEFT JOIN role AS r ON e.role_id = r.id LEFT JOIN department AS d ON r.department_id = d.id LEFT JOIN employee AS m ON m.id = e.manager_id`, (err, res) => {
            if (err) {
                console.log(error);
            } else {
                console.table(res);
            }
        })
    inquirer.prompt([
        {
            name: "removeEmp",
            type: "input",
            message: "Enter the ID of the employee you would like to delete.",
            validate: function (answer) {
                if (answer === "") {
                    console.log("You did not enter an employee ID.");
                    return false;
                } else if (isNaN(answer)) {
                    console.log("You must enter the ID of the employee you wish to delete.")
                }
                else {
                    return true;
                }
            }
        }
    ]).then((answer) => {
        connection.query(`DELETE FROM employee WHERE ?`, { id: answer.removeEmp })
        console.log(`Employee ${answer.removeEmp} has been removed from the company.`)
        promptUser();
    })
};
// const viewDeptBudget =() =>{
//     //figure this out later
// }
connection.connect((err) => {
    if (err) throw err;
    promptUser();
});