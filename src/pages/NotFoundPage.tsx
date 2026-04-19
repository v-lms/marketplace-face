import { Button, Container, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="sm">
        <Title order={1}>404</Title>
        <Text c="dimmed">Такой страницы нет</Text>
        <Button component={Link} to="/" mt="md">
          На главную
        </Button>
      </Stack>
    </Container>
  )
}
