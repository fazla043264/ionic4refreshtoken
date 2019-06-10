import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
})
export class MembersPage implements OnInit {
  categories;
  error;
  displayCategories = false;
  constructor(private http: HttpClient, private navController: NavController) { }

  // 'http://localhost:5000';
  ngOnInit() {

  }
  goTo() {
    this.displayCategories = true;
    this.http.get('http://localhost:5000/categories').subscribe(
      data => {
        this.categories = data;
        console.log(data);
      },
      (error) => {
        this.error = error;
        // this.loading.dismiss();
      }
    );
  }
}
