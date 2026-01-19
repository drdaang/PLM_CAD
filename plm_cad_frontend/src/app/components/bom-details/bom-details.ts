import { Component, signal, effect } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartService } from '../../services/part-service';
import { ActivatedRoute } from '@angular/router';
import { BomEdge } from '../../models/bom-edge';
import { ParentData } from '../../models/parent-data';
import { BomNode } from '../../models/bom-node';
import { PartInfo } from '../../models/part-info';
import { BomNodeComponent } from "../bom-node-component/bom-node-component";
// import * as binascii from 'binascii';


@Component({
  selector: 'app-bom-details',
  imports: [CommonModule, BomNodeComponent],
  templateUrl: './bom-details.html',
  styleUrl: './bom-details.css',
})
export class BomDetails implements OnInit {
  
  parent_data = signal<ParentData>({
    parent_id: "",
    parent_name: "",
    parent_part_number: ""
  });
  bom_edges = signal<BomEdge[]>([]);
  parts_list = signal<Array<Record<string, PartInfo>>>([]);



  bomDerivedData = signal<any[]>([]);

  constructor(private partService: PartService,
    private route: ActivatedRoute) {

  }
  buildPartMap(
    parts_list: Array<Record<string, PartInfo>>
  ): Map<string, PartInfo> {
    const map = new Map<string, PartInfo>();

    for (const obj of parts_list) {
      const partId = Object.keys(obj)[0];
      map.set(partId, obj[partId])
    }
    return map;
  }

  buildGraph(bom_edges: BomEdge[]):Map<string,string[]> {
    const graph = new Map<string, string[]>();
    for (const row of bom_edges) {
      if (!graph.has(row.parent_id)) {
        graph.set(row.parent_id, [])
      }
      
        graph.get(row.parent_id)!.push(row.child_id)
      
    }
    return graph;
  }
  buildTree(parent_id: string,
    graph: Map<string, string[]>,
    partMap: Map<string, PartInfo>,
    path = new Set<string>()
  ): BomNode {
    if (path.has(parent_id)) {
      return {
        id: parent_id,
        name: partMap.get(parent_id)?.name,
        part_number:partMap.get(parent_id)?.part_number,
        children: [],
        cycle: true
      }
    }

    const newPath = new Set(path);
    newPath.add(parent_id)

    return {
      id: parent_id,
      name: partMap.get(parent_id)?.name,
      part_number:partMap.get(parent_id)?.part_number,
      children: (graph.get(parent_id) || []).map(child_id =>
        this.buildTree(child_id, graph, partMap, newPath)
      ),
    }
  }




  ngOnInit(): void {
    const bomId = this.route.snapshot.paramMap.get('id')!;

    this.partService.get_bom_by_id(bomId).subscribe({
      next: (data: any) => {
        console.log('RAW API RESPONSE 👉', data);
        this.parent_data.set(data.parent_data);
        this.bom_edges.set(data.bom_edges);
        this.parts_list.set(data.parts_list);


        console.log('parent_data Details:', this.parent_data());
        console.log('bom_edges', this.bom_edges());
        console.log('parts_list', this.parts_list());
        const partMap = this.buildPartMap(this.parts_list());
        console.log('partmap:', partMap)
        const graph = this.buildGraph(this.bom_edges());
        console.log('graph:', graph)
        console.log( this.parent_data().parent_id)
        
        const tree = this.buildTree(
          this.parent_data().parent_id,
          graph,
          partMap
        );
        this.bomDerivedData.set([tree])
        console.log("Tree:", tree)
        console.log(this.parent_data().parent_part_number)
      },
      error: (err) => {
        console.error('Error fetching BOM details:', err);
      }

    })


  }



}

