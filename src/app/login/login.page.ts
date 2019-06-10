import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { LoadingController } from '@ionic/angular';
// import { Platform } from '@ionic/angular';
// import { Storage } from '@ionic/storage';
// import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  error;
  loading;
  constructor(private authService: AuthenticationService,
    private loadingController: LoadingController) { }

  ngOnInit() {
  }

  onSubmit(data) {
    this.presentLoadingWithOptions();
    return this.authService.login(data).subscribe(
      () => {
        // console.log(res);
        this.loading.dismiss();
      },
      (error) => {
      this.error = error;
        this.loading.dismiss();
      });
  }

  async presentLoadingWithOptions() {
    this.loading = await this.loadingController.create({
      spinner: 'lines',
      message: 'Please wait...',
      translucent: true
    });
    return await this.loading.present();
  }
  // getToken(){
  //   return this.storage.get(this.ACCESS_TOKEN);
  // }

}
