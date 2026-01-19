import { Component, OnInit } from '@angular/core';
import { PartService } from '../../services/part-service';
import { inject } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl,FormArray, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { computed } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-bom',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-bom.html',
  styleUrl: './create-bom.css',
})
export class CreateBom implements OnInit {
  parts: any = signal([]);
  bomForm:FormGroup;
  childParts: any = signal([]);
  bomRows: any = signal<any[]>([
  { child: null, quantity: 1, unit: 'pcs' }
]);

  constructor(private readonly router:Router) {
    this.bomForm=new FormGroup({
      parentPart:new FormControl(null,Validators.required),
      rows:new FormArray([
        new FormGroup({
          child:new FormControl(null,Validators.required),
          quantity:new FormControl(1,[Validators.required,Validators.min(1)]),
          unit:new FormControl('pcs',Validators.required)
        })
      ])
    })
  }

  PartService = inject(PartService);
  selectedParentPart = signal<any>(null);
  ngOnInit(): void {
    console.log("selected part", this.selectedParentPart()?.length)
    this.PartService
      .get_bom_details()
      .subscribe({
        next: (data: any) => {
          this.parts.set( data);
          this.childParts.set(this.parts());
          // console.log(this.parts)
        },
        error: (err) => {
          console.error('Error fetching BOM details:', err);
        }
      });

    console.log("vals:", this.validParts().length + this.selectedParentPart()?.length, this.parts()?.length)



  }
  // validRows= computed(()=>{
  //   console.log(this.bomRows())
  //   return this.parts.filter((_:any,index:any)=>!this.bomRows()[index]?.child?.name)
  // })
 disabledAddRow = computed(() => {
  if (!this.selectedParentPart()) return true;
  return this.validParts()(null).length === 1;
});

saveBom() {
  this.bomForm.patchValue({
    rows: this.bomRows()
  });
  if(this.bomForm.invalid){
    console.error("Form is invalid");
    return;
  }
  console.log('Form is valid', this.bomForm.value);
  this.PartService.create_bom(this.bomForm.value).subscribe({
    next: (res) => {
      this.router.navigate(['/dashboard']);
      console.log('BOM created successfully:', res.message);
    },
    error: (err) => {
      console.error('Error creating BOM:', err);
    }
  });
}


  disabledAddReason=computed(()=>{
    if(!this.selectedParentPart()){
      return "Select Parent Part first";

    }
    //this logic is not working as expected
    // if(this.validParts()(null).length===1){
    //   return "No more parts available to add as child";
    // }
    return null;
  })

  onParentChange() {
    this.bomForm.get('parentPart')?.setValue(this.selectedParentPart());
    console.log('Selected Parent Part:', this.selectedParentPart());
  }


  validParts = computed(() => {
  return (currentRow: any) => {
    const parentId = this.selectedParentPart()?.id;
    if (!parentId) return [];

    return this.parts().filter((part: any) => {
      return (
        part?.id !== parentId &&
        !this.bomRows().some((row: any) =>
          row !== currentRow && row.child?.id === part?.id
        )
      );
    });
  };
});

  get rows() {
    return this.bomForm.get('rows') as FormArray;
  }

  
  addRow() {
    this.rows.push(
    new FormGroup({
      child: new FormControl(null, Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      unit: new FormControl('pcs')
    })
  );

    this.bomRows.update((rows: any[]) => [
      ...rows,
      {
        child: null,
        quantity: 1,
        unit: 'pcs'
      }
    ]);
    
  }
  blockNonIntegers(event: KeyboardEvent) {
    // Allow: digits, backspace, arrow keys, delete
    if (
      !/[0-9]/.test(event.key) &&
      event.key !== 'Backspace' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Delete' &&
      event.key !== 'Tab'
    ) {
      event.preventDefault();
    }

  }
  removeRow(index:number){
    this.bomRows.update((rows:any[])=>
    rows.filter((row,i)=>i!==index))
  
    this.rows.removeAt(index);

    
    
  }


}
