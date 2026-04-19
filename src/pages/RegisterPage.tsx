import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title, Text, Anchor } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { formatApiError } from '@/lib/errors'

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: v => (v.trim().length >= 1 ? null : 'Введите имя'),
      email: v => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Введите корректный email'),
      password: v => (v.length >= 8 ? null : 'Минимум 8 символов'),
    },
  })

  if (auth.status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  const handleSubmit = form.onSubmit(async values => {
    setError(null)
    setSubmitting(true)
    try {
      await auth.register(values.name.trim(), values.email, values.password)
      notifications.show({ color: 'green', message: 'Аккаунт создан' })
      navigate('/')
    } catch (err) {
      setError(formatApiError(err, 'Не удалось зарегистрироваться'))
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Container size={420} my="xl">
      <Title ta="center" order={2}>Регистрация</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Уже есть аккаунт?{' '}
        <Anchor component={Link} to="/login" size="sm">Войти</Anchor>
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
              label="Имя"
              placeholder="Иван"
              required
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
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
              description="Минимум 8 символов"
              required
              key={form.key('password')}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={submitting} fullWidth mt="sm">
              Создать аккаунт
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
