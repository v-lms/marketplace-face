import { Alert, Anchor, Group, Paper, Skeleton, Stack, Text, Title, Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getAd, updateAd } from '@/api/ads'
import { ApiError } from '@/api/client'
import type { AdResponse, CreateAdPayload } from '@/api/types'
import { useAuth } from '@/auth/useAuth'
import { AdForm } from '@/components/AdForm'
import { formatApiError } from '@/lib/errors'

export function AdEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const auth = useAuth()

  const [ad, setAd] = useState<AdResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'not_found' | 'forbidden' | 'error'>(
    'loading',
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setStatus('not_found')
      return
    }
    const adId = Number(id)
    if (!Number.isFinite(adId)) {
      setStatus('not_found')
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    getAd(adId)
      .then(resp => {
        if (controller.signal.aborted) return
        if (auth.user && resp.user_id !== auth.user.user_id) {
          setStatus('forbidden')
          return
        }
        setAd(resp)
        setStatus('loaded')
      })
      .catch(err => {
        if (controller.signal.aborted) return
        if (err instanceof ApiError && err.status === 404) {
          setStatus('not_found')
          return
        }
        setStatus('error')
        setLoadError(formatApiError(err, 'Не удалось загрузить объявление'))
      })
    return () => controller.abort()
  }, [id, auth.user])

  const handleSubmit = async (values: CreateAdPayload) => {
    if (!ad) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const updated = await updateAd(ad.id, values)
      notifications.show({ color: 'green', message: 'Изменения сохранены' })
      navigate(`/ads/${updated.id}`)
    } catch (err) {
      setSubmitError(formatApiError(err, 'Не удалось сохранить изменения'))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={240} />
        <Skeleton height={300} />
      </Stack>
    )
  }

  if (status === 'not_found') {
    return (
      <Stack align="center" py="xl" gap="sm">
        <Title order={2}>Объявление не найдено</Title>
        <Button component={Link} to="/my-ads" leftSection={<IconArrowLeft size={16} />} mt="md">
          К моим объявлениям
        </Button>
      </Stack>
    )
  }

  if (status === 'forbidden') {
    return (
      <Stack align="center" py="xl" gap="sm">
        <Title order={2}>Нет доступа</Title>
        <Text c="dimmed">Вы можете редактировать только свои объявления</Text>
        <Button component={Link} to="/my-ads" leftSection={<IconArrowLeft size={16} />} mt="md">
          К моим объявлениям
        </Button>
      </Stack>
    )
  }

  if (status === 'error' || !ad) {
    return (
      <Stack gap="md">
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {loadError ?? 'Ошибка'}
        </Alert>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Anchor component={Link} to={`/ads/${ad.id}`} size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} />
          К объявлению
        </Group>
      </Anchor>

      <Title order={2}>Редактирование объявления</Title>

      {submitError && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {submitError}
        </Alert>
      )}

      <Paper withBorder p="xl" radius="md">
        <AdForm
          initial={{
            title: ad.title,
            description: ad.description,
            price: ad.price,
            category: ad.category,
            city: ad.city,
          }}
          submitLabel="Сохранить"
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/ads/${ad.id}`)}
        />
      </Paper>
    </Stack>
  )
}
