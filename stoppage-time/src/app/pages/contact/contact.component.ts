import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  onSubmit(): void {
    if (this.contactForm.invalid) return;
    
    this.isLoading = true;
    
    // Simulamos el envío del formulario
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;
      this.contactForm.reset();
    }, 1500);
    
    // En un caso real, aquí enviaríamos los datos a un backend
    // this.contactService.sendMessage(this.contactForm.value).subscribe(...)
  }
}