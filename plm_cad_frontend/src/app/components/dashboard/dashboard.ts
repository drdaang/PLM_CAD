import { Component, OnInit, signal } from '@angular/core';
import { PartService } from '../../services/part-service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  parts = signal<any>([]);
  isLoading=signal(true)
  constructor(private partService: PartService,private router:Router) {}

  openPart(partId:string){
    this.router.navigate(['/parts',partId])
  }
  openBom(partId:string, $event?: Event  ){
    $event?.stopPropagation();
    this.router.navigate(['/bom-details',partId])
  }

  ngOnInit(): void {
    this.partService.show_dashboard().subscribe({
      next: (data) => {
        this.parts.set(data);
        this.isLoading.set(false)
        console.log('Dashboard data:', data);
      },
      error: (err) => {
        this.isLoading.set(false)
        console.error('Dashboard error:', err);
      }
    });
  }
}
