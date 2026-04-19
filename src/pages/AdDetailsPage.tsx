import {
  Alert,
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconEye,
  IconMapPin,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { deleteAd, getAd } from '@/api/ads'
import { ApiError } from '@/api/client'
import type { AdResponse } from '@/api/types'
import { useAuth } from '@/auth/useAuth'
import { formatApiError } from '@/lib/errors'
import { formatDate, formatPrice } from '@/lib/format'

export function AdDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const auth = useAuth()

  const [ad, setAd] = useState<AdResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'not_found' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [confirmOpened, confirmHandlers] = useDisclosure(false)

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
        setError(formatApiError(err, 'Не удалось загрузить объявление'))
      })
    return () => controller.abort()
  }, [id])

  const isOwner =
    auth.status === 'authenticated' &&
    !!auth.user &&
    !!ad &&
    ad.user_id === auth.user.user_id &&
    ad.status === 'active'

  const confirmDelete = async () => {
    if (!ad) return
    setDeleting(true)
    try {
      await deleteAd(ad.id)
      notifications.show({ color: 'green', message: 'Объявление удалено' })
      confirmHandlers.close()
      navigate('/my-ads')
    } catch (err) {
      notifications.show({
        color: 'red',
        message: formatApiError(err, 'Не удалось удалить объявление'),
      })
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading') {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={200} />
        <Skeleton height={32} width={120} />
        <Skeleton height={120} />
      </Stack>
    )
  }

  if (status === 'not_found') {
    return (
      <Stack align="center" py="xl" gap="sm">
        <Title order={2}>Объявление не найдено</Title>
        <Text c="dimmed">Возможно, оно было архивировано или удалено</Text>
        <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />} mt="md">
          К списку
        </Button>
      </Stack>
    )
  }

  if (status === 'error' || !ad) {
    return (
      <Stack gap="md">
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {error ?? 'Ошибка'}
        </Alert>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          w="fit-content"
        >
          Назад
        </Button>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Anchor component={Link} to="/" size="sm">
        <Group gap={4}>
          <IconArrowLeft size={14} />
          К списку
        </Group>
      </Anchor>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Title order={1} style={{ flex: 1 }}>{ad.title}</Title>
            {isOwner && (
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="light"
                  leftSection={<IconEdit size={16} />}
                  component={Link}
                  to={`/ads/${ad.id}/edit`}
                >
                  Редактировать
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={confirmHandlers.open}
                >
                  Удалить
                </Button>
              </Group>
            )}
          </Group>

          <Title order={2} c="indigo">{formatPrice(ad.price)}</Title>

          <Group gap="xs">
            <Badge variant="light" color="indigo" size="lg">{ad.category}</Badge>
            <Badge variant="light" size="lg" leftSection={<IconMapPin size={14} />}>
              {ad.city}
            </Badge>
            {ad.status === 'archived' && (
              <Badge color="gray" size="lg">В архиве</Badge>
            )}
          </Group>

          <Divider />

          <Text style={{ whiteSpace: 'pre-wrap' }}>{ad.description}</Text>

          <Divider />

          <Group gap="xl" c="dimmed">
            {ad.user_name && (
              <Group gap={6}>
                <IconUser size={16} />
                <Text size="sm">{ad.user_name}</Text>
              </Group>
            )}
            <Group gap={6}>
              <IconCalendar size={16} />
              <Text size="sm">Опубликовано {formatDate(ad.created_at)}</Text>
            </Group>
            <Group gap={6}>
              <IconEye size={16} />
              <Text size="sm">{ad.views} просмотров</Text>
            </Group>
          </Group>
        </Stack>
      </Paper>

      <Modal
        opened={confirmOpened}
        onClose={() => (deleting ? null : confirmHandlers.close())}
        title="Удалить объявление"
        centered
      >
        <Stack>
          <Text size="sm">
            Объявление «{ad.title}» будет отправлено в архив. Продолжить?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={confirmHandlers.close}
              disabled={deleting}
            >
              Отмена
            </Button>
            <Button color="red" onClick={confirmDelete} loading={deleting}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
