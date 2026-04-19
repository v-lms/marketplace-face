import { Button, Grid, Group, NumberInput, Paper, Select, TextInput } from '@mantine/core'
import { IconFilter, IconSearch, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import type { SearchQuery, SearchSort } from '@/api/types'

interface Props {
  initial: SearchQuery
  onApply: (next: SearchQuery) => void
  onReset: () => void
}

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'date', label: 'По дате' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
]

export function FiltersPanel({ initial, onApply, onReset }: Props) {
  const [q, setQ] = useState(initial.q ?? '')
  const [category, setCategory] = useState(initial.category ?? '')
  const [city, setCity] = useState(initial.city ?? '')
  const [minPrice, setMinPrice] = useState<number | string>(initial.min_price ?? '')
  const [maxPrice, setMaxPrice] = useState<number | string>(initial.max_price ?? '')
  const [sort, setSort] = useState<SearchSort | ''>(initial.sort ?? '')

  useEffect(() => {
    setQ(initial.q ?? '')
    setCategory(initial.category ?? '')
    setCity(initial.city ?? '')
    setMinPrice(initial.min_price ?? '')
    setMaxPrice(initial.max_price ?? '')
    setSort(initial.sort ?? '')
  }, [initial])

  const handleApply = () => {
    onApply({
      q: q.trim() || undefined,
      category: category.trim() || undefined,
      city: city.trim() || undefined,
      min_price: typeof minPrice === 'number' ? minPrice : undefined,
      max_price: typeof maxPrice === 'number' ? maxPrice : undefined,
      sort: (sort || undefined) as SearchSort | undefined,
    })
  }

  const handleReset = () => {
    setQ('')
    setCategory('')
    setCity('')
    setMinPrice('')
    setMaxPrice('')
    setSort('')
    onReset()
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Grid gap="sm">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            label="Поиск"
            placeholder="MacBook Pro"
            leftSection={<IconSearch size={16} />}
            value={q}
            onChange={e => setQ(e.currentTarget.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleApply()
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            label="Категория"
            placeholder="Электроника"
            value={category}
            onChange={e => setCategory(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            label="Город"
            placeholder="Москва"
            value={city}
            onChange={e => setCity(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
          <NumberInput
            label="Цена от"
            placeholder="0"
            min={0}
            value={minPrice}
            onChange={setMinPrice}
            thousandSeparator=" "
          />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
          <NumberInput
            label="Цена до"
            placeholder="∞"
            min={0}
            value={maxPrice}
            onChange={setMaxPrice}
            thousandSeparator=" "
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            label="Сортировка"
            placeholder="По умолчанию"
            data={SORT_OPTIONS}
            value={sort || null}
            onChange={v => setSort((v ?? '') as SearchSort | '')}
            clearable
          />
        </Grid.Col>
      </Grid>
      <Group justify="flex-end" mt="md" gap="sm">
        <Button variant="subtle" leftSection={<IconX size={16} />} onClick={handleReset}>
          Сбросить
        </Button>
        <Button leftSection={<IconFilter size={16} />} onClick={handleApply}>
          Применить
        </Button>
      </Group>
    </Paper>
  )
}
