import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PlantsService } from 'src/app/services/plants/plants.service';
import { CountriesService } from 'src/app/services/countries/countries.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: any = null;
  plants: any[] = [];
  countries: any[] = [];
  categoriesForPlant: any[] = [];

  newPlantForm: FormGroup;
  combinedForm: FormGroup;
  editCategoryForm: FormGroup;

  selectedCategory: any;
  selectedPlant: any;

  animatingPlantId: string = '';
  searchQuery: string = '';
  selectedCountry: string = '';
  sortColumn: string = '';
  errorMessage: string = '';

  isSortedAsc: boolean = true;
  isFirstLoad: boolean = true;


  constructor(private fb: FormBuilder, private cookieService: CookieService, private router: Router, private plantsService: PlantsService,
    private countriesService: CountriesService) {
    this.newPlantForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^(?!\s*$).+/)]],
      country: ['', Validators.required]
    });

    this.combinedForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^(?!\s*$).+/)]],
      country: ['', Validators.required],
      selectedCategory: [null, Validators.required],
      readings: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      mediumAlerts: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      redAlerts: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      disabledSensors: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });

    this.editCategoryForm = this.fb.group({
      selectedCategory: [null, Validators.required],
      readings: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      mediumAlerts: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      redAlerts: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      disabledSensors: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });

    this.newPlantForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });

  }


  ngOnInit(): void {
    const userCookie = this.cookieService.get('user');

    if (userCookie) {
      this.user = JSON.parse(userCookie);

      this.getPlantsByUserId(this.user.id);
      this.getAllCountries();
    } else {
      this.router.navigate(['/login']);
    }
  }


  getCategoriesByPlantID(plantId: string): void {
    if (!plantId) {
      console.error("El ID de la planta no es válido");
      return;
    }
    this.plantsService.getCategoriesByID(plantId).subscribe(
      (categories) => {
        this.categoriesForPlant = categories;

      },
      (error) => {
        console.error('Error al obtener las categorías de la planta:', error);
      }
    );
  }

  getCategoryIcon(idCategory: number): string {
    const icons: { [key: number]: string } = {
      1: 'assets/Temperature.svg',
      2: 'assets/Pressure.svg',
      3: 'assets/Wind.svg',
      4: 'assets/Levels.svg',
      5: 'assets/Energy.svg',
      6: 'assets/Stress.svg',
      7: 'assets/Monoxide.svg',
      8: 'assets/Others.svg',
    };
    return icons[idCategory] || 'assets/Default.svg';
  }

  calculateTotals(plant: any = null): { readings: number; mediumAlerts: number; redAlerts: number; disabledSensors: number } {
    let totalReadings = 0;
    let totalMediumAlerts = 0;
    let totalRedAlerts = 0;
    let totalDisabledSensors = 0;

    if (plant) {
      if (plant.categoryDataList) {
        plant.categoryDataList.forEach((category: any) => {
          totalReadings += category.readings || 0;
          totalMediumAlerts += category.mediumAlerts || 0;
          totalRedAlerts += category.redAlerts || 0;
          totalDisabledSensors += category.disabledSensors || 0;
        });
      }
    } else {
      this.filteredPlants.forEach((plant: any) => {
        if (plant.categoryDataList) {
          plant.categoryDataList.forEach((category: any) => {
            totalReadings += category.readings || 0;
            totalMediumAlerts += category.mediumAlerts || 0;
            totalRedAlerts += category.redAlerts || 0;
            totalDisabledSensors += category.disabledSensors || 0;
          });
        }
      });
    }

    return {
      readings: totalReadings,
      mediumAlerts: totalMediumAlerts,
      redAlerts: totalRedAlerts,
      disabledSensors: totalDisabledSensors,
    };
  }


  getPlantsByUserId(userId: string): void {
    this.plantsService.getPlantsByUserID(userId).subscribe(

      (plants) => {
        this.plants = plants;

        this.sortPlantsAsc();

        if (this.isFirstLoad && this.plants.length > 0) {
          const firstPlant = this.plants[0];
          this.selectPlant(firstPlant);
          this.isFirstLoad = false;
        }

        this.getFlagsForPlants();
        this.calculateTotals();
      },
      (error) => {
        if (error.status === 404) {
          console.log('No hay plantas para este usuario.');
          this.plants = [];
        } else {
          console.error('Error al obtener las plantas', error);
        }
      }
    );
  }


  getFlagsForPlants(): void {
    this.plants.forEach((plant) => {
      if (plant.country) {
        this.countriesService.getCountryByName(plant.country).subscribe(
          (response) => {
            const countryData = response[0];
            plant.flagUrl = countryData.flags?.svg || '';
          },
          (error) => {
            console.error(`Error al obtener la bandera para ${plant.country}`, error);
            plant.flagUrl = '';
          }
        );
      }
    });
  }

  getAllCountries(): void {
    this.countriesService.getAllCountries().subscribe(
      (response) => {
        this.countries = response.map((country: any) => ({
          name: country.name.common
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
      },
      (error) => {
        console.error('Error al obtener los paises', error);
      }
    );
  }

  createPlant(): void {
    if (this.newPlantForm.valid) {
      const plant = {
        name: this.newPlantForm.get('name')?.value,
        country: this.newPlantForm.get('country')?.value,
        user: { id: this.user.id }
      };

      this.plantsService.createPlant(plant).subscribe(
        (response) => {
          this.plants.push(response);
          this.getFlagsForPlants();
          this.sortPlantsAsc()
          this.newPlantForm.reset();
        },
        (error) => {
          if (error.status === 409) {
            this.errorMessage = '* Ya tienes una planta con ese nombre y pais.';
          } else {
            this.errorMessage = '* Error al crear la planta.';
          }
        }
      )
    }
  }


  cancelForm(form: any): void {
    form.reset();
  }

  onBackdropClick(event: MouseEvent, form: any): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('modal')) {
      this.cancelForm(form);
    }
  }

  deletePlant(plantId: string): void {

    this.animatingPlantId = plantId;
    this.isFirstLoad = true;

    setTimeout(() => {
      this.plantsService.deletePlant(plantId).subscribe(
        () => {
          this.getPlantsByUserId(this.user.id);
              },
        (error) => {
          if (error.status === 200) {
            console.log('Planta eliminada, pero Angular lo interpreta como error:', error);
            this.getPlantsByUserId(this.user.id);
          } else {
            console.log('Error al intentar eliminar la planta:', error);
          }
        }
      );
    }, 550);
  }


  get filteredPlants() {
    return this.plants.filter(plant =>
      plant.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
      (this.selectedCountry ? plant.country === this.selectedCountry : true)
    );
  }


  sortPlantsAsc() {
    this.plants.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.isSortedAsc = !this.isSortedAsc;
    } else {
      this.sortColumn = column;
      this.isSortedAsc = true;
    }

    this.plants.sort((a, b) => {

      const valueA = this.getValueFromPlant(a, column);
      const valueB = this.getValueFromPlant(b, column);

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const lowerA = valueA.toLowerCase();
        const lowerB = valueB.toLowerCase();
        if (lowerA < lowerB) return this.isSortedAsc ? -1 : 1;
        if (lowerA > lowerB) return this.isSortedAsc ? 1 : -1;
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.isSortedAsc ? valueA - valueB : valueB - valueA;
      }

      return 0;
    });
  }


  getValueFromPlant(plant: any, column: string): any {
    if (!plant || !plant.categoryDataList) {
      return 0;
    }

    if (
      column === 'readings' ||
      column === 'mediumAlerts' ||
      column === 'redAlerts' ||
      column === 'disabledSensors'
    ) {
      return plant.categoryDataList.reduce((total: number, category: any) => {
        const value = category[column] || 0;
        return total + (typeof value === 'number' ? value : 0);
      }, 0);
    }

    return plant[column];
  }



  deleteFilters(): void {
    this.searchQuery = '';
    this.selectedCountry = '';
    this.getPlantsByUserId(this.user.id);
    this.calculateTotals();
  }

  isFormValid(form: any): boolean {
    return form.valid;
  }


  selectPlant(plant: any): void {
    this.selectedPlant = plant;
    this.getCategoriesByPlantID(plant.id_plant);
  }

  EditPlant(): void {
    const plantData = {
      id: this.selectedPlant.id_plant,
      name: this.combinedForm.get('name')?.value,
      country: this.combinedForm.get('country')?.value,
    };

    const categoryData = {
      id: this.selectedCategory.id,
      readings: this.combinedForm.get('readings')?.value,
      mediumAlerts: this.combinedForm.get('mediumAlerts')?.value,
      redAlerts: this.combinedForm.get('redAlerts')?.value,
      disabledSensors: this.combinedForm.get('disabledSensors')?.value,
    };

    this.plantsService.updatePlant(plantData.id, plantData).subscribe(
      () => {

        this.selectedPlant.name = plantData.name;
        this.selectedPlant.country = plantData.country;
        
        this.plantsService.updateCategory(categoryData.id, categoryData).subscribe(
          () => {
            this.getPlantsByUserId(this.user.id);
            this.getCategoriesByPlantID(plantData.id);
          },
          error => {
            console.error('Error al actualizar la categoría:', error);
          }
        );
      },
      error => {
        console.error('Error al actualizar la planta:', error);
      }
    );
  }

  editOnlyCategory(): void {
    const categoryData = {
      id: this.selectedCategory.id,
      readings: this.editCategoryForm.get('readings')?.value,
      mediumAlerts: this.editCategoryForm.get('mediumAlerts')?.value,
      redAlerts: this.editCategoryForm.get('redAlerts')?.value,
      disabledSensors: this.editCategoryForm.get('disabledSensors')?.value,
    };


    this.plantsService.updateCategory(categoryData.id, categoryData).subscribe(
          () => {
            this.getPlantsByUserId(this.user.id);
            this.getCategoriesByPlantID(this.selectedPlant.id_plant);
          },
          error => {
            console.error('Error al actualizar la categoría:', error);
          },
    );
  }


  openEditModal(plant: any): void {
    this.selectedPlant = plant;

    this.combinedForm.patchValue({
      name: plant.name,
      country: plant.country,
    });

    this.plantsService.getCategoriesByID(plant.id_plant).subscribe(
      (categories) => {
        this.categoriesForPlant = categories;

        if (this.categoriesForPlant.length > 0) {
          this.selectedCategory = this.categoriesForPlant[0];

          this.combinedForm.patchValue({
            selectedCategory: this.selectedCategory.id,
            readings: this.selectedCategory.readings,
            mediumAlerts: this.selectedCategory.mediumAlerts,
            redAlerts: this.selectedCategory.redAlerts,
            disabledSensors: this.selectedCategory.disabledSensors,
          });
        }
      },
      (error) => console.error('Error al obtener las categorías:', error)
    );
  }

  openEditCategoryModal(category: any): void {
    this.selectedCategory = category;

    this.editCategoryForm.patchValue({
      selectedCategory: this.selectedCategory.id,
            readings: this.selectedCategory.readings,
            mediumAlerts: this.selectedCategory.mediumAlerts,
            redAlerts: this.selectedCategory.redAlerts,
            disabledSensors: this.selectedCategory.disabledSensors,
    });
  }  

  onCategoryChange(event: Event): void {
    const selectedCategoryId = (event.target as HTMLSelectElement).value;
    this.selectedCategory = this.categoriesForPlant.find(category => category.id === +selectedCategoryId);

    if (this.selectedCategory) {
      this.combinedForm.patchValue({
        readings: this.selectedCategory.readings,
        mediumAlerts: this.selectedCategory.mediumAlerts,
        redAlerts: this.selectedCategory.redAlerts,
        disabledSensors: this.selectedCategory.disabledSensors,
      });
    }
  }



}

