import { computed, toValue, type MaybeRefOrGetter } from 'vue'

export function useFormattedCurrency(money: MaybeRefOrGetter<number>) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  return computed(() => formatCurrency(toValue(money)))
}
