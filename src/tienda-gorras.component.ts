import { Component, OnInit } from '@angular/core';
// Importa Cap, CapService, CartItem (asumo que CapService.ts exporta estas interfaces y el servicio)
import { Cap, CapService, CartItem } from './CapService'; 
import { CommonModule } from '@angular/common'; // Solo CommonModule
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-tienda-gorras',
  templateUrl: 'index.html',
  styleUrls: ['styles.css'],
  standalone: true, 
  // CommonModule ya incluye CurrencyPipe, DatePipe, NgIf, NgFor, etc.
  imports: [CommonModule, FormsModule], 
  providers: [CapService] 
})
export class TiendaGorrasComponent implements OnInit {

  caps: Cap[] = [];
  capsFiltered: Cap[] = [];
  capTypes: { key: Cap['type'], name: string }[] = [];
  
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  cartCount: number = 0;

  searchTerm: string = '';
  filterByType: string = '';

  constructor(private capService: CapService) {}

  ngOnInit(): void {
    // 1. Inicialización de datos y filtros
    this.caps = this.capService.getAllCaps();
    this.capTypes = this.capService.getCapTypes();
    this.applyFilters(); 

    // 2. Suscripción al estado reactivo del carrito
    this.capService.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.cartTotal = this.capService.getCartTotal(cart);
      this.cartCount = this.capService.getCartItemsCount(cart);
    });
  }

  // --- Métodos de Interacción del Componente ---

  addToCart(id: string): void {
    this.capService.addToCart(id, 1);
    // Nota: Aquí se podría añadir lógica de notificación (toasts o alertas)
  }
  
  updateQty(id: string, delta: number): void {
      this.capService.updateCartItemQty(id, delta);
  }

  checkout(): void {
    if (confirm(`Total a pagar: $${this.cartTotal.toFixed(2)}. ¿Confirmar pago?`)) {
      this.capService.clearCart();
      alert('Pago simulado — Carrito vaciado.');
    }
  }

  getProductName(id: string): string {
      return this.capService.getCapById(id)?.name || 'Producto Desconocido';
  }

  // --- Lógica de Filtros ---

  onFilterTypeChange(target: any): void {
      this.filterByType = target.value;
      this.applyFilters();
  }

  applyFilters(): void {
      let filtered = this.caps.slice();

      if (this.filterByType) {
          filtered = filtered.filter(p => p.type === this.filterByType);
      }

      const q = this.searchTerm.toLowerCase();
      if (q) {
          filtered = filtered.filter(p =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          );
      }

      this.capsFiltered = filtered;
  }
}