import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  isEditingProfile = false;
  isChangingPassword = false;
  
  successMessage = '';
  errorMessage = '';
  passwordError = '';
  
  isLoading = false;
  isPasswordLoading = false;
  
  // Para la subida de imágenes de perfil
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  
  // Control de pestañas alternativo
  activeSecurityTab: 'password' | 'session' = 'password';
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    // Redirigir si no está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Obtener los datos del usuario
    this.loadUserProfile();
    
    // Inicializar formularios
    this.initForms();
  }
  
  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      user => {
        this.user = user;
        this.updateProfileForm();
      },
      error => {
        console.error('Error al cargar el perfil:', error);
        this.snackBar.open('Error al cargar el perfil', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }
  
  initForms(): void {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  updateProfileForm(): void {
    if (!this.user) return;
    
    this.profileForm.patchValue({
      name: this.user.name,
      email: this.user.email
    });
  }
  
  // Validador personalizado para verificar que las contraseñas coinciden
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      this.updateProfileForm();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
    this.passwordError = '';
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files?.length) {
      return;
    }
    
    this.selectedFile = input.files[0];
    
    // Verificar tamaño del archivo (máximo 5MB)
    if (this.selectedFile.size > 5 * 1024 * 1024) {
      this.snackBar.open('La imagen no debe superar los 5MB', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      return;
    }
    
    // Verificar tipo de archivo (solo imágenes)
    if (!this.selectedFile.type.startsWith('image/')) {
      this.snackBar.open('El archivo debe ser una imagen (JPG, PNG, etc.)', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      return;
    }
    
    // Crear preview usando FileReader para convertir a URL de datos
    const reader = new FileReader();
    reader.onload = () => {
      // Asegurar que el resultado sea string o ArrayBuffer
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
  
  uploadProfileImage(): void {
    if (!this.selectedFile) {
      return;
    }
    
    const formData = new FormData();
    formData.append('profileImage', this.selectedFile);
    
    this.isLoading = true;
    
    this.userService.uploadProfileImage(formData).subscribe(
      response => {
        this.isLoading = false;
        this.snackBar.open('Imagen de perfil actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Limpiar selección
        this.selectedFile = null;
        this.previewUrl = null;
        
        // Recargar el perfil para mostrar la nueva imagen
        this.loadUserProfile();
      },
      error => {
        this.isLoading = false;
        this.snackBar.open('Error al subir la imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    const { name, email } = this.profileForm.value;
    
    this.userService.updateUserProfile({ name, email }).subscribe(
      user => {
        this.isLoading = false;
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.user = user;
        this.isEditingProfile = false;
      },
      error => {
        this.isLoading = false;
        
        if (error.status === 400) {
          this.snackBar.open('El correo ya está registrado', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    );
  }
  
  savePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.isPasswordLoading = true;
    
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.userService.changePassword(currentPassword, newPassword).subscribe(
      () => {
        this.isPasswordLoading = false;
        this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.isChangingPassword = false;
        this.passwordForm.reset();
      },
      error => {
        this.isPasswordLoading = false;
        
        if (error.status === 400) {
          this.snackBar.open('La contraseña actual no es correcta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        } else {
          this.snackBar.open('Error al cambiar la contraseña', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    );
  }
  
  logout(): void {
    this.authService.logout();
  }
}