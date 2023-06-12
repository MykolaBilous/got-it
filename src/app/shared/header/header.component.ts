import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() public archiveHeader: boolean = false;

  public openFilterContainer(): void {
    document.getElementById('filter-container').classList.toggle('hidden');
  }

  public openMobileMenu(): void {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  }
}
