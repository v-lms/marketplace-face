import {
  Button,
  Grid,
  Group,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'

import type { CreateAdPayload } from '@/api/types'

export interface AdFormInitial {
  title?: string
  description?: string
  price?: number
  category?: string
  city?: string
}

interface Props {
  initial?: AdFormInitial
  submitLabel: string
  submitting?: boolean
  onSubmit: (values: CreateAdPayload) => void | Promise<void>
  onCancel?: () => void
}

interface FormValues {
  title: string
  description: string
  price: number | ''
  category: string
  city: string
}

export function AdForm({ initial, submitLabel, submitting, onSubmit, onCancel }: Props) {
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      price: typeof initial?.price === 'number' ? initial.price : '',
      category: initial?.category ?? '',
      city: initial?.city ?? '',
    },
    validate: {
      title: v =>
        v.trim().length === 0
          ? 'Введите заголовок'
          : v.length > 255
            ? 'Не более 255 символов'
            : null,
      description: v => (v.trim().length === 0 ? 'Введите описание' : null),
      price: v =>
        typeof v !== 'number' || Number.isNaN(v)
          ? 'Укажите цену'
          : v < 0
            ? 'Цена не может быть отрицательной'
            : null,
      category: v =>
        v.trim().length === 0
          ? 'Укажите категорию'
          : v.length > 100
            ? 'Не более 100 символов'
            : null,
      city: v =>
        v.trim().length === 0
          ? 'Укажите город'
          : v.length > 100
            ? 'Не более 100 символов'
            : null,
    },
  })

  const handleSubmit = form.onSubmit(values => {
    if (typeof values.price !== 'number') return
    return onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      price: values.price,
      category: values.category.trim(),
      city: values.city.trim(),
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Заголовок"
          placeholder="iPhone 14 Pro, 256 GB, как новый"
          required
          key={form.key('title')}
          {...form.getInputProps('title')}
        />
        <Textarea
          label="Описание"
          placeholder="Расскажите о товаре"
          autosize
          minRows={4}
          required
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <Grid gap="sm">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <NumberInput
              label="Цена, ₽"
              placeholder="0"
              min={0}
              thousandSeparator=" "
              allowNegative={false}
              decimalScale={0}
              required
              key={form.key('price')}
              {...form.getInputProps('price')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label="Категория"
              placeholder="Электроника"
              required
              key={form.key('category')}
              {...form.getInputProps('category')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label="Город"
              placeholder="Москва"
              required
              key={form.key('city')}
              {...form.getInputProps('city')}
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="sm" gap="sm">
          {onCancel && (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={onCancel}
              disabled={submitting}
            >
              Отмена
            </Button>
          )}
          <Button
            type="submit"
            loading={submitting}
            leftSection={<IconDeviceFloppy size={16} />}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
