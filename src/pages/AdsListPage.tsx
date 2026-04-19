import { Alert, Badge, Card, Center, Grid, Group, Pagination, Skeleton, Stack, Text, Title } from '@mantine/core'
import { IconAlertCircle, IconMapPin, IconMoodEmpty } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { searchAds } from '@/api/search'
import type { SearchHit, SearchQuery, SearchResponse, SearchSort } from '@/api/types'
import { FiltersPanel } from '@/components/FiltersPanel'
import { formatApiError } from '@/lib/errors'
import { formatPrice } from '@/lib/format'

const PAGE_SIZE = 12

function parseQuery(params: URLSearchParams): SearchQuery {
  const num = (key: string): number | undefined => {
    const v = params.get(key)
    if (v === null || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const sort = params.get('sort') as SearchSort | null
  return {
    q: params.get('q') || undefined,
    category: params.get('category') || undefined,
    city: params.get('city') || undefined,
    min_price: num('min_price'),
    max_price: num('max_price'),
    sort: sort || undefined,
    limit: PAGE_SIZE,
    offset: num('offset') ?? 0,
  }
}

function queryToParams(q: SearchQuery): URLSearchParams {
  const p = new URLSearchParams()
  if (q.q) p.set('q', q.q)
  if (q.category) p.set('category', q.category)
  if (q.city) p.set('city', q.city)
  if (typeof q.min_price === 'number') p.set('min_price', String(q.min_price))
  if (typeof q.max_price === 'number') p.set('max_price', String(q.max_price))
  if (q.sort) p.set('sort', q.sort)
  if (q.offset && q.offset > 0) p.set('offset', String(q.offset))
  return p
}

function SearchHitCard({ hit }: { hit: SearchHit }) {
  return (
    <Card
      component={Link}
      to={`/ads/${hit.ad_id}`}
      withBorder
      shadow="xs"
      padding="md"
      radius="md"
      style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Stack gap="xs" h="100%">
        <Title order={4} lineClamp={2}>
          {hit.title}
        </Title>
        <Text fw={600} size="lg" c="indigo">
          {formatPrice(hit.price)}
        </Text>
        <Text size="sm" c="dimmed" lineClamp={3}>
          {hit.description}
        </Text>
        <Group gap={6} mt="auto">
          <Badge variant="light" color="indigo">{hit.category}</Badge>
          <Badge variant="light" leftSection={<IconMapPin size={12} />}>{hit.city}</Badge>
        </Group>
      </Stack>
    </Card>
  )
}

export function AdsListPage() {
  const [params, setParams] = useSearchParams()
  const query = useMemo(() => parseQuery(params), [params])

  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    searchAds(query)
      .then(resp => {
        if (!controller.signal.aborted) setData(resp)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(formatApiError(err, 'Не удалось загрузить объявления'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [query])

  const total = data?.total ?? 0
  const currentPage = Math.floor((query.offset ?? 0) / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const updateQuery = (next: SearchQuery) => {
    setParams(queryToParams({ ...next, offset: 0 }))
  }

  const resetFilters = () => {
    setParams(new URLSearchParams())
  }

  const goToPage = (page: number) => {
    const nextOffset = Math.max(0, (page - 1) * PAGE_SIZE)
    const nextParams = queryToParams({ ...query, offset: nextOffset })
    setParams(nextParams)
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Объявления</Title>
          {data && <Text c="dimmed" size="sm">Найдено: {data.total}</Text>}
        </div>
      </Group>

      <FiltersPanel initial={query} onApply={updateQuery} onReset={resetFilters} />

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {error}
        </Alert>
      )}

      {loading && (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
              <Skeleton height={200} radius="md" />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <Center py="xl">
          <Stack align="center" gap={4}>
            <IconMoodEmpty size={32} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed">По заданным фильтрам ничего не найдено</Text>
          </Stack>
        </Center>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <>
          <Grid>
            {data.items.map(hit => (
              <Grid.Col key={hit.ad_id} span={{ base: 12, sm: 6, md: 4 }}>
                <SearchHitCard hit={hit} />
              </Grid.Col>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination value={currentPage} total={totalPages} onChange={goToPage} />
            </Group>
          )}
        </>
      )}
    </Stack>
  )
}
