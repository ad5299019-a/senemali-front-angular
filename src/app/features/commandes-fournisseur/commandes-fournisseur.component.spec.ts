import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandesFournisseurComponent } from './commandes-fournisseur.component';

describe('CommandesFournisseurComponent', () => {
  let component: CommandesFournisseurComponent;
  let fixture: ComponentFixture<CommandesFournisseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandesFournisseurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandesFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
