import { Alert, Anchor, Group, Paper, Stack, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createAd } from '@/api/ads'
import type { CreateAdPayload } from '@/api/types'
import { AdForm } from '@/components/AdForm'
import { formatApiError } from '@/lib/errors'

export function AdCreatePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: CreateAdPayload) => {
    setError(null)
    setSubmitting(true)
    try {
      const ad = await createAd(values)
      notifications.show({ color: 'green', message: 'Объявление опубликовано' })
      navigate(`/ads/${ad.id}`)
    } catch (err) {
      setError(formatApiError(err, 'Не удалось создать объявление'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack gap="md">
      <Anchor component={Link} to="/my-ads" size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} />
          К моим объявлениям
        </Group>
      </Anchor>

      <Title order={2}>Новое объявление</Title>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {error}
        </Alert>
      )}

      <Paper withBorder p="xl" radius="md">
        <AdForm
          submitLabel="Опубликовать"
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </Paper>
    </Stack>
  )
}
