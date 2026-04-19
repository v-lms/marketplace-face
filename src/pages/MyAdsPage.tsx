import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Modal,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  IconAlertCircle,
  IconEdit,
  IconEye,
  IconMoodEmpty,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deleteAd, listMyAds } from '@/api/ads'
import type { AdResponse, MyAdsResponse } from '@/api/types'
import { formatApiError } from '@/lib/errors'
import { formatDate, formatPrice } from '@/lib/format'

const PAGE_SIZE = 20

export function MyAdsPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<MyAdsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpened, confirmHandlers] = useDisclosure(false)

  const load = useCallback(
    (targetPage: number, signal?: AbortSignal) => {
      setLoading(true)
      setError(null)
      return listMyAds({ limit: PAGE_SIZE, offset: (targetPage - 1) * PAGE_SIZE })
        .then(resp => {
          if (signal?.aborted) return
          setData(resp)
        })
        .catch(err => {
          if (signal?.aborted) return
          setError(formatApiError(err, 'Не удалось загрузить ваши объявления'))
        })
        .finally(() => {
          if (!signal?.aborted) setLoading(false)
        })
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    void load(page, controller.signal)
    return () => controller.abort()
  }, [page, load])

  const askDelete = (ad: AdResponse) => {
    setPendingDelete(ad)
    confirmHandlers.open()
  }

  const closeConfirm = () => {
    if (deleting) return
    confirmHandlers.close()
    setPendingDelete(null)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteAd(pendingDelete.id)
      notifications.show({ color: 'green', message: 'Объявление удалено' })
      confirmHandlers.close()
      setPendingDelete(null)
      await load(page)
    } catch (err) {
      notifications.show({
        color: 'red',
        message: formatApiError(err, 'Не удалось удалить объявление'),
      })
    } finally {
      setDeleting(false)
    }
  }

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Мои объявления</Title>
          {data && <Text c="dimmed" size="sm">Всего: {data.total}</Text>}
        </div>
        <Button component={Link} to="/ads/new" leftSection={<IconPlus size={16} />}>
          Создать объявление
        </Button>
      </Group>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {error}
        </Alert>
      )}

      {loading && !data && (
        <Stack>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={56} radius="sm" />
          ))}
        </Stack>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <Paper withBorder p="xl" radius="md">
          <Center>
            <Stack align="center" gap={8}>
              <IconMoodEmpty size={32} color="var(--mantine-color-dimmed)" />
              <Text c="dimmed">Вы ещё не публиковали объявлений</Text>
              <Button
                component={Link}
                to="/ads/new"
                leftSection={<IconPlus size={16} />}
                mt="xs"
              >
                Создать первое
              </Button>
            </Stack>
          </Center>
        </Paper>
      )}

      {data && data.items.length > 0 && (
        <Paper withBorder radius="md" p="xs">
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Заголовок</Table.Th>
                <Table.Th>Цена</Table.Th>
                <Table.Th>Категория</Table.Th>
                <Table.Th>Город</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th>Обновлено</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.items.map(ad => (
                <Table.Tr key={ad.id}>
                  <Table.Td>
                    <Text fw={500} lineClamp={1}>{ad.title}</Text>
                  </Table.Td>
                  <Table.Td>{formatPrice(ad.price)}</Table.Td>
                  <Table.Td>{ad.category}</Table.Td>
                  <Table.Td>{ad.city}</Table.Td>
                  <Table.Td>
                    {ad.status === 'active' ? (
                      <Badge color="teal" variant="light">Активно</Badge>
                    ) : (
                      <Badge color="gray" variant="light">В архиве</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{formatDate(ad.updated_at)}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Открыть">
                        <ActionIcon
                          variant="subtle"
                          component={Link}
                          to={`/ads/${ad.id}`}
                          aria-label="Открыть"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Редактировать">
                        <ActionIcon
                          variant="subtle"
                          component={Link}
                          to={`/ads/${ad.id}/edit`}
                          aria-label="Редактировать"
                          disabled={ad.status !== 'active'}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Удалить">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => askDelete(ad)}
                          disabled={ad.status !== 'active'}
                          aria-label="Удалить"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination value={page} total={totalPages} onChange={setPage} />
        </Group>
      )}

      <Modal
        opened={confirmOpened}
        onClose={closeConfirm}
        title="Удалить объявление"
        centered
      >
        <Stack>
          <Text size="sm">
            Объявление{' '}
            {pendingDelete && <strong>«{pendingDelete.title}»</strong>}{' '}
            будет отправлено в архив. Продолжить?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={closeConfirm} disabled={deleting}>
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
