import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('http://localhost:5000/categories').subscribe(
      data => this.categories = data
    );
  }

}
