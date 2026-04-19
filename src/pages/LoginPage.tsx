import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title, Text, Anchor } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { formatApiError } from '@/lib/errors'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')
  const redirectTo = next ? decodeURIComponent(next) : '/'
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: v => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректный email'),
      password: v => (v.length >= 1 ? null : 'Введите пароль'),
    },
  })

  if (auth.status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = form.onSubmit(async values => {
    setError(null)
    setSubmitting(true)
    try {
      await auth.login(values.email, values.password)
      notifications.show({ color: 'green', message: 'Вы вошли' })
      navigate(redirectTo)
    } catch (err) {
      setError(formatApiError(err, 'Не удалось войти'))
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Container size={420} my="xl">
      <Title ta="center" order={2}>Вход</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Нет аккаунта?{' '}
        <Anchor component={Link} to="/register" size="sm">Зарегистрироваться</Anchor>
      </Text>

      <Paper withBorder shadow="sm" p="lg" mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert variant="light" color="red" icon={<IconAlertCircle size={16} />}>
                {error}
              </Alert>
            )}
            <TextInput
              label="Email"
              placeholder="user@example.com"
              type="email"
              required
              key={form.key('email')}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Пароль"
              required
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={submitting} fullWidth mt="sm">
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
