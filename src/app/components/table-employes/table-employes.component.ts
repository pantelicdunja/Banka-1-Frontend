import {Component, OnInit} from '@angular/core';
import {Customer, Employee, UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'app-table-employes',
  templateUrl: './table-employes.component.html',
  styleUrls: ['./table-employes.component.css']
})
export class TableEmployesComponent implements OnInit{

  hasCreateEmployeePermission: boolean = true;  // treba da se promeni na false kada se doda auth

  isEmployeeModalOpen: boolean = false;
  employees: Employee[] = [];
  searchQuery: string = '';
  displayedData: Employee[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private userService: UserService, private modalService: ModalService) {
    this.displayedData = this.employees;
    this.calculatePagination();

  }

  ngOnInit() {
     this.loadEmployees()
  }






  loadEmployees() {
    this.userService.fetchEmployees().subscribe({
      next: (data) => {
        this.employees = data.employees;
        this.totalItems = data.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.displayedData = this.employees;
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
      },
    });
  }

  calculatePagination() {
    const data = this.employees
    this.totalItems = data.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedData = this.employees.slice(start, end);
  }

  filterData(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedData = this.employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm) ||
    employee.lastName.toLowerCase().includes(searchTerm) ||
    employee.position.toLowerCase().includes(searchTerm) ||
    employee.email.toLowerCase().includes(searchTerm)
  );

  }

  editPerson(person: Employee | Customer) {
    this.modalService.openModal('employee', person);
  }

  // openModal(person: Employee | Customer) {
  //   if (this.isEmployee(person)) {
  //     this.modalService.openModal('employee', person);
  //   } else if (this.isCustomer(person)) {
  //     this.modalService.openModal('customer', person);
  //   } else {
  //     console.error('Unknown type:', person);
  //   }
  // }


  // deletePerson(person: Employee | Customer) {
  //   this.userService.deletePerson(person, this.displayedData);
  // }

  deletePerson(person: Employee | Customer) {
    if (this.isEmployee(person)) {

      this.userService.deleteEmployee(person.id).subscribe({
        next: (data) => {
          this.displayedData = this.displayedData.filter(p => p.id !== person.id);
        },
        error: (error) => {
          console.error('Error fetching employees:', error);
        },
      });

    } else if (this.isCustomer(person)) {

      this.userService.deleteCustumer(person.id).subscribe({
        next: (data) => {
          this.displayedData = this.displayedData.filter(p => p.id !== person.id);
        },
        error: (error) => {
          console.error('Error fetching employees:', error);
        },
      });

    } else {
      console.error('Unknown type:', person);
    }
  }

  private isEmployee(person: Employee | Customer): person is Employee {
      return (person as Employee).username !== undefined;
    }

    private isCustomer(person: Employee | Customer): person is Customer {
      return (person as Customer).povezaniRacuni !== undefined;
    }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }

  openEmployeeModal(): void {
    this.isEmployeeModalOpen = true;
  }
  closeEmployeeModal(): void {
    console.log("BBBB")
    this.isEmployeeModalOpen = false;
  }

}
