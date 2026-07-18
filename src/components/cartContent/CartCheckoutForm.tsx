import { memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, DELIVERY_OPTIONS, DELIVERY_NEIGHBORHOODS } from "../../lib/constants";
import { PixReceiptUpload } from "./PixReceiptUpload";
import { CashChangeField } from "./CashChangeField";

interface CartCheckoutFormProps {
  customerName: string;
  phone: string;
  street: string;
  neighborhood: string;
  complement: string;
  paymentMethod: string;
  deliveryType: string;
  error: string | null;
  onCustomerNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onComplementChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onDeliveryTypeChange: (value: string) => void;
  pixReceiptPreview: string | null;
  pixReceiptUrl: string | null;
  pixReceiptUploading: boolean;
  pixReceiptError: string | null;
  onPixReceiptSelect: (file: File) => void;
  onPixReceiptClear: () => void;
  changeFor: string;
  noChangeNeeded: boolean;
  onChangeForChange: (value: string) => void;
  onNoChangeNeededChange: (value: boolean) => void;
}

/**
 * Formulário de checkout com dados do cliente e forma de pagamento
 * Memoizado para evitar re-renderizações desnecessárias
 */
export const CartCheckoutForm = memo(function CartCheckoutForm({
  customerName,
  phone,
  street,
  neighborhood,
  complement,
  paymentMethod,
  deliveryType,
  error,
  onCustomerNameChange,
  onPhoneChange,
  onStreetChange,
  onNeighborhoodChange,
  onComplementChange,
  onPaymentMethodChange,
  onDeliveryTypeChange,
  pixReceiptPreview,
  pixReceiptUrl,
  pixReceiptUploading,
  pixReceiptError,
  onPixReceiptSelect,
  onPixReceiptClear,
  changeFor,
  noChangeNeeded,
  onChangeForChange,
  onNoChangeNeededChange,
}: CartCheckoutFormProps) {

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3">
        {/* Campo: Nome */}
        <div className="grid gap-1.5">
          <Label htmlFor="customerName">Nome</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        {/* Campo: Telefone */}
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="(11) 99999-0000"
          />
        </div>

        {/* Campo: Forma de Pagamento */}
        <div className="grid gap-1.5">
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger id="paymentMethod" className="w-full">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagamento via PIX: chave + comprovante */}
        {paymentMethod === "pix" && (
          <PixReceiptUpload
            preview={pixReceiptPreview}
            receiptUrl={pixReceiptUrl}
            uploading={pixReceiptUploading}
            error={pixReceiptError}
            onFileSelect={onPixReceiptSelect}
            onClear={onPixReceiptClear}
          />
        )}

        {/* Pagamento em dinheiro: troco */}
        {paymentMethod === "dinheiro" && (
          <CashChangeField
            value={changeFor}
            noChangeNeeded={noChangeNeeded}
            onChange={onChangeForChange}
            onNoChangeNeededChange={onNoChangeNeededChange}
          />
        )}

        {/* Campo: Tipo de Entrega */}
        <div className="grid gap-1.5">
          <Label htmlFor="deliveryType">Tipo de Entrega</Label>
          <Select value={deliveryType} onValueChange={onDeliveryTypeChange}>
            <SelectTrigger id="deliveryType" className="w-full">
              <SelectValue placeholder="Selecione o tipo de entrega" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campo: Rua e Número */}
        <div className="grid gap-1.5">
          <Label htmlFor="street">Endereço</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => onStreetChange(e.target.value)}
            placeholder="Rua X, número 123"
          />
        </div>

        {/* Campo: Bairro */}
        <div className="grid gap-1.5">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Select value={neighborhood} onValueChange={onNeighborhoodChange}>
            <SelectTrigger id="neighborhood" className="w-full">
              <SelectValue placeholder="Selecione o bairro" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_NEIGHBORHOODS.map((neighborhoodOption) => (
                <SelectItem key={neighborhoodOption.value} value={neighborhoodOption.value}>
                  {neighborhoodOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campo: Complemento */}
        <div className="grid gap-1.5">
          <Label htmlFor="complement">Complemento</Label>
          <Textarea
            id="complement"
            value={complement}
            onChange={(e) => onComplementChange(e.target.value)}
            placeholder="Apto, bloco, referência, etc (opcional)"
          />
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
});
