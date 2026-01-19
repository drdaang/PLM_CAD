import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
// import { Part } from '../../models/part';
import { ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormControl,FormGroup } from '@angular/forms';
import { PartService } from '../../services/part-service';
import { Part } from '../../models/part';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-part',
  imports: [ReactiveFormsModule],
  templateUrl: './create-part.html',
  styleUrl: './create-part.css',
})
export class CreatePart {
    loading=false
    error:string|null=null;

    partForm = new FormGroup({
    name: new FormControl('', {nonNullable:true,validators:Validators.required}),
    partNumber: new FormControl('', {nonNullable:true,validators:Validators.required}),
    description: new FormControl('') ,
    PartFile: new FormControl<File|null>(null)
  });
  constructor(
        private partService:PartService,
        private router:Router
  ){}

  onFileChange(event:Event){
    const input = event.target as HTMLInputElement;
    if(!input.files || input.files.length===0) return;

    const cadFile = input.files[0];
    this.partForm.patchValue({PartFile:cadFile});
    this.partForm.get('PartFile')?.markAsDirty();
  }

  submit(){
    if(this.partForm.invalid) return;
    this.loading= true;
    this.error=null;

    this.partService.createPart(this.partForm.value as any).subscribe({
      next:()=>{
        this.partForm.reset({
          name:'',
          partNumber:'',
          description:'',
          PartFile:null
        }
        );
        this.router.navigate(['/dashboard']);
      },
      error:(err)=>{
        this.error=err?.error?.detail || 'Failed to create part',
        this.loading = false
      },
      complete:()=>{
        this.loading=false
      }
    })
  }
}
