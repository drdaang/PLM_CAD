import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartService } from '../../services/part-service';
import { SafeUrlPipe } from '../../pipes/safe-url-pipe';

@Component({
  selector: 'app-part-details',
  templateUrl: './part-details.html',
  imports:[SafeUrlPipe],
  styleUrl:'./part-details.css'
})
export class PartDetailsComponent implements OnInit {

  part = signal<any>(null);
  fileUrl!:string
  constructor(
    private route: ActivatedRoute,
    private partService: PartService
  ) {}
  isPdf(filename: string | undefined): boolean {
  return filename?.toLowerCase().endsWith('.pdf') ?? false;
}

  ngOnInit(): void {
    const partId = this.route.snapshot.paramMap.get('id')!;
    this.fileUrl = `http://localhost:8000/parts/${partId}/file`;
    // this.part().filename=this.part().filename?this.fileUrl:'Not Available'
    this.partService.getPartById(partId).subscribe(res => {
      this.part.set(res);
      console.log(this.part())
    });
    
  }
}
