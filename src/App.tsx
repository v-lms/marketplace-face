import { AppShell, Button, Container, Group, Skeleton, Text, Title, Anchor } from '@mantine/core'
import {
  IconList,
  IconLogin,
  IconLogout,
  IconPlus,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'

import { RequireAuth } from '@/auth/RequireAuth'
import { useAuth } from '@/auth/useAuth'
import { AdCreatePage } from '@/pages/AdCreatePage'
import { AdDetailsPage } from '@/pages/AdDetailsPage'
import { AdEditPage } from '@/pages/AdEditPage'
import { AdsListPage } from '@/pages/AdsListPage'
import { LoginPage } from '@/pages/LoginPage'
import { MyAdsPage } from '@/pages/MyAdsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'

export default function App() {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.logout()
    navigate('/')
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" underline="never">
              <Title order={3} c="indigo">МАРКЕТ</Title>
            </Anchor>
            <Group gap="sm">
              {auth.status === 'loading' && <Skeleton height={28} width={140} radius="sm" />}
              {auth.status === 'authenticated' && auth.user && (
                <>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/my-ads"
                    leftSection={<IconList size={16} />}
                  >
                    Мои объявления
                  </Button>
                  <Button
                    component={Link}
                    to="/ads/new"
                    leftSection={<IconPlus size={16} />}
                  >
                    Создать
                  </Button>
                  <Group gap={6}>
                    <IconUser size={18} />
                    <Text size="sm">{auth.user.name}</Text>
                  </Group>
                  <Button
                    variant="subtle"
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Выйти
                  </Button>
                </>
              )}
              {auth.status === 'anonymous' && (
                <>
                  <Button
                    variant="subtle"
                    component={Link}
                    to="/login"
                    leftSection={<IconLogin size={16} />}
                  >
                    Войти
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    leftSection={<IconUserPlus size={16} />}
                  >
                    Регистрация
                  </Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="md">
          <Routes>
            <Route path="/" element={<AdsListPage />} />
            <Route
              path="/my-ads"
              element={
                <RequireAuth>
                  <MyAdsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ads/new"
              element={
                <RequireAuth>
                  <AdCreatePage />
                </RequireAuth>
              }
            />
            <Route
              path="/ads/:id/edit"
              element={
                <RequireAuth>
                  <AdEditPage />
                </RequireAuth>
              }
            />
            <Route path="/ads/:id" element={<AdDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
