'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Calendar, DollarSign } from 'lucide-react';
import type { Expense, Payment } from '@/types';

interface AdvancedSearchProps {
  expenses: Expense[];
  payments: Payment[];
  onFilterChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  searchTerm: string;
  category: string;
  status: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  category: 'all',
  status: 'all',
  minAmount: '',
  maxAmount: '',
  startDate: '',
  endDate: '',
};

export function AdvancedSearch({ expenses, payments, onFilterChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    expenses.forEach(e => {
      if (e.customCategory) cats.add(e.customCategory);
    });
    return Array.from(cats);
  }, [expenses]);

  // Obtener estados únicos
  const statuses = ['pending', 'paid', 'partial', 'overdue'];

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== 'all');

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, nota o categoría..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-9"
            aria-label="Buscar gastos"
          />
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Filtros avanzados"
        >
          <Filter className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={resetFilters} aria-label="Limpiar filtros">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
          {/* Categoría */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Categoría</label>
            <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Estado</label>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'pending' && 'Pendiente'}
                    {status === 'paid' && 'Pagado'}
                    {status === 'partial' && 'Parcial'}
                    {status === 'overdue' && 'Vencido'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monto mínimo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Monto mín.</label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="pl-7 h-9"
                aria-label="Monto mínimo"
              />
            </div>
          </div>

          {/* Monto máximo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Monto máx.</label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="number"
                placeholder="∞"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="pl-7 h-9"
                aria-label="Monto máximo"
              />
            </div>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="pl-7 h-9"
                aria-label="Fecha desde"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="pl-7 h-9"
                aria-label="Fecha hasta"
              />
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="md:col-span-2 lg:col-span-2 flex items-end">
            <Badge variant="secondary" className="text-xs">
              Filtros activos: {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
