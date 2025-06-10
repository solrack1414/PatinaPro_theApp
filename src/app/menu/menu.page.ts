import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false, // Indica que este componente no es independiente
})
export class MenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
