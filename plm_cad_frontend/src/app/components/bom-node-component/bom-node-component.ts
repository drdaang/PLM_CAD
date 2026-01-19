import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BomNode {
  id: string;
  name: string;
  part_number?: string;
  quantity?: number;
  children?: BomNode[];
  cycle?: boolean; // true if cycle detected from backend/tree builder
}

@Component({
  selector: 'app-bom-node-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bom-node-component.html',
  styleUrl: './bom-node-component.css',
})
export class BomNodeComponent implements OnInit {

  @Input({ required: true })
  node!: BomNode;
  ngOnInit(): void {
    console.log(this.node)
  }
  // expand / collapse state
  expanded = signal(false);

  toggle(): void {
    // if no children or cycle → don't expand
    if (!this.node.children?.length || this.node.cycle) {
      return;
    }
    this.expanded.update(v => !v);
  }

  trackById = (_: number, node: BomNode) => node.id;
}
